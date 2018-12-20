class P2p {

    static get WIFI() { return 'wifi'};

    static get ETHERNET() { return 'ethernet'};

    /**
     * @param {Number} port
     * @param {Number} retransmissionTimer
     * TODO REMOVE debug string, cont
     */
    constructor(port, retransmissionTimer, debugString) {

        this.debugString = debugString;
        /**
         * @type {Number}
         */
        this.port = port;

        /**
         * @type {String|null}
         */
        this.ip = null;

        /**
         * @type {Number}
         * @private
         */
        this._id = Utils.uid;

        /**
         * @type {Number}
         */
        this.retransmissionTimer = retransmissionTimer;

        /**
         * @type {module:dgram.Socket|null}
         */
        this.broadcaster = null;

        /**
         * @type {Array}
         */
        this.clients = [];

        /**
         * @type {null}
         */
        this.server = null;

        this._createUdpClientBroadcaster();

        this._setDefaultIp();

        this._loopAlive();
    }

    /**
     * @private
     */
    _createUdpClientBroadcaster() {

        this.broadcaster = require('dgram').createSocket("udp4");

        this.broadcaster.on('listening', this._onBroadcasterListening.bind(this));

        this.broadcaster.on('message', this._onBroadcasterMessage.bind(this));

        this.broadcaster.on('error', this._onBroadcasterError.bind(this));

        this.broadcaster.bind(this.port);
    }

    /**
     * @param {String} ip
     */
    setIp(ip) {
        this.ip = ip;
    }

    /**
     * @return {string}
     */
    getIp() {
        return this.ip;
    }

    /**
     * @param cont
     * @private
     */
    _setDefaultIp() {
        let listIp = P2p.getLocalIp();
        this.ip = listIp.length > 0 ? listIp[0] : null;
    }

    /**
     * @return {{debugString: *, ip: String}}
     */
    generateMessage() {
        return {
            'id' : this._id,
            'debugString' : this.debugString,
            'ip' : this.ip
        };
    }

    /**
     * @private
     */
    _onBroadcasterListening() {
        console.log('BROADCASTER LISTENING');
        this.broadcaster.setBroadcast(true);
    }

    /**
     * @param message
     * @param info
     * @private
     */
    _onBroadcasterMessage(message, info) {
        let jsonMessage = JSON.parse(message.toString());
        console.log('BROADCASTER MESSAGE', info.address, info.port, jsonMessage);
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
                this.broadcaster.send(stringMessage, 0, stringMessage.length, this.port, '255.255.255.255');
                this._loopAlive();
            },
            this.retransmissionTimer
        );
    }

    /**
     * @return {Array}
     */
    static getLocalIp() {

        let os = require('os');
        let networkInterfaces = os.networkInterfaces();
        let result = [];
        let networkInterface = {};

        Object.keys(networkInterfaces).forEach(function (networkInterfaceName) {
            let alias = 0;

            networkInterfaces[networkInterfaceName].forEach(function (loopNetworkInterface) {
                if ('IPv4' !== loopNetworkInterface.family || loopNetworkInterface.internal !== false) {
                    // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
                    return;
                }

                networkInterface = {
                    name : networkInterfaceName,
                    ip : loopNetworkInterface.address
                };

                if (alias >= 1) {
                    networkInterface.alias = alias;
                }

                result.push(networkInterface);

                ++alias;
            });
        });

        return result;
    }
}