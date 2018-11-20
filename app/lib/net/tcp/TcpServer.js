try {
    Utils = require('./../Utils');
}
catch (err) {

    Utils = require(__dirname + '/lib/Utils.js');
}


class TcpServer  {

    static get DEFAULT_PORT() {return 8002} ;

    static get DEFAULT_IP() {return '127.0.0.1'} ;

    constructor(options = {}) {

        const net = require('net');

        this.sockets = [];

        /**
         * @type {"net".Server}
         */
        this.server = net.createServer(function(socket) {

            /**
             * @type {"net".Socket}
             */
            this.sockets.push(socket);

            socket.id = Utils.uid;
            socket.on('end', this._remove.bind({socket: socket, "client": this}));
            socket.on('close', this._remove.bind({socket: socket, "client": this}));

            socket.on('data', this.data.bind(this));
        }.bind(this));

        /**
         *
         */
        this.server.listen(
            options.port ? options.port : TcpClient.DEFAULT_PORT,
            options.ip ? options.ip : TcpClient.DEFAULT_IP
        );

        /**
         * Events
         */
        this.server.on('error', this._error.bind(this));
        this.server.on('listening', this._listen.bind(this));

    }

    send(data) {

        for (let cont = 0; this.sockets.length > cont; cont++) {
            this.sockets[cont].write(data);
        }
    }

    /**
     * @param evt
     */
    data(evt) {
        console.log('TCP DATA', evt.toString());
    }

    /**
     */
    _remove() {
        console.log('TCP REMOVE', this);
        let index = this.client.sockets.findIndex(socket => {
           return socket.id === this.socket.id;
        });

        if (index > -1) {
            this.client.sockets.splice(index, 1);
        }
    }

    /**
     */
    _listen() {
        console.log('TCP LISTEN', 'Start listening');
    }

    /**
     * @param evt
     */
    _error(evt) {
        console.log('TCP ERROR', evt);
    }
}

module.exports = TcpServer;