try {
    EvtManager = require('./../EvtManager');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

class P2p {

    static get SERVER_MESSAGE() { return 'message'};

    static get ADAPTER_TCP() { return 'tcp'};

    static get BROADCASTER_IP() { return '255.255.255.255'};

    /**
     * @param {Object} updClienOptions
     * @param {Object} serverOptions
     * @param {string} identifier
     */
    constructor(updClienOptions, serverOptions, identifier) {

        /**
         * @type {string}
         */
        this.identifier = identifier;

        /**
         * @type {Object}
         */
        this.updClienOptions = updClienOptions;

        /**
         * @type {Object}
         */
        this.serverOptions = serverOptions;

        /**
         * @type {module:dgram.Socket|null}
         */
        this.updClient = this._createUdpClientBroadcaster();

        /**
         * @type {Array}
         */
        this.adapterClients = [];

        /**
         * @type {null}
         */
        this.adapterServer = null;

        /**
         *
         */
        this.eventManager = new EvtManager();

        this.senderParser = null;

        this.receiverParser = null;

        /**
         * Config
         */
        this._loopAlive();
    }

    /**
     * @return {module:dgram.Socket}
     * @private
     */
    _createUdpClientBroadcaster() {

        let updClient = require('dgram').createSocket("udp4");

        updClient.on('listening', this._onBroadcasterListening.bind(this));

        updClient.on('message', this._onBroadcasterMessage.bind(this));

        updClient.on('error', this._onBroadcasterError.bind(this));

        updClient.bind(this.updClienOptions.portListening);

        return updClient;
    }

    /**
     * @param {string} ip
     * @return {boolean}
     */
    hasIpClient(ip) {
        return this.adapterClients.findIndex((element) => {
            return element.remoteAddress === ip;
        }) >= 0;
    }

    /**
     * @return {{debugString: *, ip: String}}
     */
    generateMessage() {
        return {
            'id' : this.identifier,
            'port' : this.serverOptions.port
        };
    }

    /**
     * @private
     */
    _onBroadcasterListening() {
        console.log('BROADCASTER LISTENING');
        this.updClient.setBroadcast(true);
    }

    /**
     * @param message
     * @param info
     * @private
     */
    _onBroadcasterMessage(message, info) {
        let jsonMessage = JSON.parse(message.toString());

        /**
         * me
         */
        if (jsonMessage.id === this.identifier) {

            if (!this.adapterServer) {
                this.createServer(info.address);
            }
            return;
        }

        if (!this.hasIpClient(info.address) && this.adapterServer) {
            this.createClient(info.address, jsonMessage.port);
        }
    }

    /**
     * @param error
     * @private
     */
    _onBroadcasterError(error) {
        console.log('BROADCASTER ERROR', error);
    }

    /**
     * @param message
     * @private
     */
    _onServerMessage(message) {
        let parsedMessage = this.receiverParser.parse(message);
        console.log('SERVER MESSAGE', parsedMessage);
        this.eventManager.fire(P2p.SERVER_MESSAGE, parsedMessage);
    }

    /**
     * @param message
     * @private
     */
    _onClientMessage(message) {
        //console.log('CLIENT MESSAGE', message.toString());
    }

    /**
     *
     */
    _loopAlive() {
        setTimeout(
            () =>  {
                let stringMessage = JSON.stringify(this.generateMessage());
                // console.log("SEND MESSAGE", stringMessage);
                this.updClient.send(stringMessage, 0, stringMessage.length, this.updClienOptions.portSender, '255.255.255.255');
                this._loopAlive();
            },
            this.updClienOptions.transmissionTimeout
        );
    }

    /**
     * @return {null}
     */
    getServer() {
        return this.adapterServer;
    }

    /**
     * @param ip
     */
    createServer(ip) {

        console.log('CREATE SERVER',this.serverOptions.port,  ip, this.serverOptions.type);
        switch (this.serverOptions.type) {
            case P2p.ADAPTER_TCP:
                let net = require('net');

                this.adapterServer = net.createServer((socket) => {
                    socket.write('Echo server' + this.identifier);
                    socket.pipe(socket);

                    socket.on('data', this._onServerMessage.bind(this));
                });

                this.adapterServer.listen(this.serverOptions.port,  ip);
                break;
            default:
                throw 'Type adapter not found';
                break
        }
    }

    /**
     * @param ip
     * @param port
     */
    createClient(ip, port) {
        switch (this.serverOptions.type) {
            case P2p.ADAPTER_TCP:
                console.log('CLIENT CREAZIONE', ip);
                //  this.clients.push(P2p.createConnectionAdapter(info.address));
                try {
                    let net = require('net');

                    var client = new net.Socket();
                    client.connect(port, ip, () => {
                        console.log('CLIENT CONNESSO');
                        this.adapterClients.push(client);
                    });

                    client.on('data', this._onClientMessage.bind(this));

                    client.on('close', function() {
                        console.log('CLIENT CHIUSO');
                        this.p2p.clearEndConnection();
                    }.bind({client : client, p2p : this}));

                } catch (e) {
                    console.error(e);
                }
                break;
            default:
                throw 'Type adapter not found';
                break
        }
    }

    /**
     * @param event
     * @param callback
     */
    on(event, callback) {
        this.eventManager.on(event, callback);
    }

    /**
     * @param message
     */
    send(message) {
        let parsedMessage = this.senderParser.parse(message);
        for (let cont = 0; this.adapterClients.length > cont; cont++) {
            this.adapterClients[cont].write(parsedMessage);
        }
    }

    /**
     *
     */
    clearEndConnection() {
        let length = this.adapterClients.length;
        for (let cont = 0; length > cont; cont++) {
            if (this.adapterClients[cont] && !this.adapterClients[cont].connecting) {
                this.adapterClients[cont].destroy();
                this.adapterClients.splice(cont, 1);
            }
        }
    }

    /**
     * @return {null|*}
     */
    getSenderParser() {
        return this.senderParser;
    }

    /**
     * @param value
     * @return {P2p}
     */
    setSenderParser(value) {
        this.senderParser = value;
        return this;
    }

    /**
     * @return {null|*}
     */
    getReceiverParser() {
        return this.receiverParser;
    }

    /**
     * @param value
     * @return {P2p}
     */
    setReceiverParser(value) {
        this.receiverParser = value;
        return this;
    }
}