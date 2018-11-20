try {
    Utils = require('./../Utils');
}
catch (err) {

    Utils = require(__dirname + '/lib/Utils.js');
}


class TcpClient  {

    static get DEFAULT_PORT() {return 8002} ;

    static get DEFAULT_IP() {return '127.0.0.1'} ;

    constructor(options = {}) {

        /**
         * @type {boolean}
         */
        this.active = false;

        /**
         * @type {boolean}
         */
        this.autoRetry = options.autoRetry ? options.autoRetry : false;

        /**
         * @type {number}
         */
        this.port = options.port ? options.port : TcpClient.DEFAULT_PORT;

        /**
         * @type {*|string}
         */
        this.ip = options.ip ? options.ip : TcpClient.DEFAULT_IP;

        this.connect(this.ip, this.port);
    }

    /**
     * @param ip
     * @param port
     * @private
     */
    connect(ip, port) {

        let net = require('net');
        this.socket = new net.Socket();
        this.socket.connect(
            port,
            ip
        );

        /**
         * Events
         */
        this.socket.on('data', this.data.bind(this));
        this.socket.on('close', this._close.bind(this));
        this.socket.on('error', this._error.bind(this));
        this.socket.on('connect', this._connect.bind(this));
    }

    send(data) {

       this.socket.write(data);
    }


    /**
     * @param evt
     */
    data(evt) {
        console.log('TCP CLIENT  DATA', evt.toString());
    }


    _connect(evt) {
        console.log('TCP CLIENT CONNECT', this, evt);
    }

    /**
     */
    _close() {
       console.warn('TCP CLIENT CLOSE', this);
       this.socket.destroy();
       if (this.autoRetry) {
           setTimeout(
               function () {
                   this.connect(this.ip, this.port)
               }.bind(this),
                3000
           );
       }
    }


    /**
     * @param evt
     */
    _error(evt) {
        console.warn('TCP CLIENT ERROR', evt);
    }
}

module.exports = TcpClient;