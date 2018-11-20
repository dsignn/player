class AggregateSender {

    /**
     * @param {Array} adapters
     */
    constructor (adapters) {

        /**
         * @type {Array}
         */
        this.adapters = [];

        /**
         *
         */
        this.setAdapters(adapters);
    }

    /**
     *
     * @param adapters
     * @return {AggregateSender}
     */
    setAdapters(adapters) {

        for (let cont = 0; adapters.length > cont; cont++) {
            if (typeof adapters[cont].send !== "function") {
                throw 'Wrong Adapter'
            }
        }

        this.adapters = adapters;
        return this;
    }

    /**
     *
     * @param evt
     * @param data
     */
    send(evt, data) {

        for (let cont = 0; this.adapters.length > cont; cont++) {
            this.adapters[cont].send(evt, data);
        }
    }
}
