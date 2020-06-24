/**
 * @class AbstractInjector
 */
export class AbstractInjector {

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

    /**
     *  @return string
     */
    get serviceNamespace() {
        throw 'method must be override';
    }

    /**
     *  @return string
     */
    getTextProperty() {
        return 'name';
    }

    /**
     * @param {Object} data
     * @param {TimeslotDataReference} dataReference
     * @return {Object}
     */
    extractMedatadaFromData(data, dataReference) {
        let nameSpace = this._extractNamespaceFromData(data);

        if (!nameSpace[this.getTextProperty()]) {
            throw 'Text property data not found';
        }
        return nameSpace[this.getTextProperty()];
    }

    /**
     * @param  {Object} data
     * @return {string}
     * @private
     */
    _extractNamespaceFromData(data) {
        if (!data[this.serviceNamespace()]) {
            throw 'Name space data not found';
        }
        return data[this.serviceNamespace()];
    }
}