/**
 *
 */
class TimeslotDataInjectorServicePluginManager extends require('dsign-library').serviceManager.ServiceManager {

    /**
     * @returns TimeslotDataServicePluginManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new TimeslotDataServicePluginManager();
        }
        return this.instance;
    }

    /**
     * @param name
     * @returns {*}
     */
    get(name) {
        return this.validateService(super.get(name));
    }

    /**
     * @param service
     * @return {*}
     */
    validateService(service) {

        switch (true) {
            case service === null:
            case typeof service !== 'object':
            case service['getServiceData'] === null:
            case typeof service['getServiceData'] !== 'function':
            case service['getTimeslotData'] === null:
            case typeof service['getTimeslotData'] !== 'function':
            case service['extractTimeslot'] === null:
            case typeof service['extractTimeslot'] !== 'function':
                throw `Error wrong service ${service.constructor.name} for TimeslotDataServicePluginManager`;
                break
        }

        return service;
    }
}

module.exports = TimeslotDataInjectorServicePluginManager;