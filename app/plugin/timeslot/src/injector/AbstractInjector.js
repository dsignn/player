
class AbstractInjector {

    /**
     * @param {string} value
     * @return Promise
     */
    getServiceData(value) {
        throw 'method must be override';
    }

    /**
     * @param {Object} data
     * @return Promise
     */
    getTimeslotData(data) {
        throw 'method must be override';
    }

    /**
     * @param {Object} data
     */
    extractTimeslot(data) {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    get serviceName() {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        throw 'method must be override';
    }

    get serviceNamespace() {
        throw 'method must be override';
    }


    getTextProperty() {
        return 'name';
    }
}

module.exports = AbstractInjector;