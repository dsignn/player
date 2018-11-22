class AbstractSender {

    /**
     *
     * @param {string} evt
     * @param {Object} data
     */
    send(evt, data) {
        throw 'Must be implement'
    }
}
