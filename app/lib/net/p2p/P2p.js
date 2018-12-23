class P2p {

    static get WIFI() { return 'wifi'};

    static get ETHERNET() { return 'ethernet'};

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
       // console.log("RECEIVE MESSAGE", jsonMessage);
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
            console.log('CLIENT CREAZIONE', info.address);
          //  this.clients.push(P2p.createConnectionAdapter(info.address));
            try {
                let net = require('net');

                var client = new net.Socket();
                client.connect(jsonMessage.port, info.address, () => {
                    console.log('CLIENT CONNESSO');
                    this.adapterClients.push(client);
                });

                client.on('data', (data) => {
                    console.log('CLIENT RICEZIONE', data.toString());
                //    client.destroy(); // kill client after server's response
                });

                client.on('close', function() {
                    console.log('CLIENT CHIUSO');
                    this.p2p.clearEndConnection();
                }.bind({client : client, p2p : this}));

            } catch (e) {
                console.error(e);
            }
        }
    }

    /**
     * @param {string} ip
     * @return {boolean}
     */
    hasIpClient(ip) {
        // TODO
        return this.adapterClients.length > 0;
    }

    /**
     * @param error
     * @private
     */
    _onBroadcasterError(error) {
        console.log('BROADCASTER ERROR', error);
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
        let net = require('net');
        console.log('CREATE SERVER',this.serverOptions.port,  ip);
        this.adapterServer = net.createServer((socket) => {
            socket.write('Echo server' + this.identifier);
            socket.pipe(socket);

            socket.on('data', function (data) {
                console.log('RICEZIONE SERVER', data.toString());
            });
        });

        this.adapterServer.listen(this.serverOptions.port,  ip);
    }

    /**
     * @param message
     */
    send(message) {
        for (let cont = 0; this.adapterClients.length > cont; cont++) {
            this.adapterClients[cont].write(message);
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
                console.log(this.adapterClients, 'dai porco dio');
            }
        }
    }
}