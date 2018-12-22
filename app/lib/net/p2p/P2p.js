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
            'id' : this.identifier
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
        console.log('BROADCASTER MESSAGE', info.address, info.port, jsonMessage);
        if (!this.hasIpClient(info.address)) {
            console.log('CREARE connection');
          //  this.clients.push(P2p.createConnectionAdapter(info.address));
        }
    }

    /**
     * @param {string} ip
     * @return {boolean}
     */
    hasIpClient(ip) {
        // TODO
        return false;
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