class P2p {

    static get WIFI() { return 'wifi'};

    static get ETHERNET() { return 'ethernet'};

    static get BROADCASTER_IP() { return '255.255.255.255'};

    /**
     * @param {Object} updClienOptions
     * @param {Object} clientOptions
     * @param {string} identifier
     */
    constructor(updClienOptions, clientOptions, identifier) {

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
        this.clientOptions = clientOptions;

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
            'port' : this.clientOptions.port
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
                console.log('CREARE SERVER', info.address, info.port, jsonMessage);
                let net = require('net');

                this.adapterServer = net.createServer((socket) => {
                    socket.write('Echo server\r\n');
                    socket.pipe(socket);
                });

                this.adapterServer.listen(this.adapterClients.port,  info.address);

            }
            return;
        }

        if (!this.hasIpClient(info.address)) {
            console.log('CREARE CLIENT', info.address);
          //  this.clients.push(P2p.createConnectionAdapter(info.address));
            let net = require('net');

            var client = new net.Socket();
            client.connect(jsonMessage.port, info.address, function() {
                console.log('Connected');
                client.write('Hello, server! Love, Client.');
            });

            client.on('data', function(data) {
                console.log('Received: ' + data);
                client.destroy(); // kill client after server's response
            });

            client.on('close', function() {
                console.log('Connection closed');
            });

            this.adapterClients.push(client);
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
                this.updClient.send(stringMessage, 0, stringMessage.length, this.updClienOptions.portSender, '255.255.255.255');
                this._loopAlive();
            },
            this.updClienOptions.transmissionTimeout
        );
    }
}