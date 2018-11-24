
class LastReplacementDataInjector extends AbstractInjector {

    constructor(soccerService) {
        super();

        this.selectData = [
            {name: MatchSoccer.HOME_TEAM},
            {name: MatchSoccer.GUEST_TEAM}
        ];

        /**
         * @type {SoccerService}
         */
        this.soccerService = soccerService;
    }

    /**
     * @param {TimerService} service
     */
    setTimerService(service) {

    }

    /**
     * @param {string} value
     * @return Promise
     */
    getServiceData(value) {
        return new Promise((resolve, reject) => {
            resolve(this.selectData);
        });
    }

    /**
     * @param {Object} data
     * @return Promise
     */
    getTimeslotData(data) {
        return new Promise((resolve, reject) => {
            try {
                let replacemens = this.soccerService.getTeam(data.name).replacemens;
                let result = {};
                if (Array.isArray(replacemens) && replacemens.length > 0) {
                    result[this.serviceNamespace()] = replacemens[0];
                    result.playerIn = this.soccerService.getTeam(data.name).getPlayer(replacemens[0].playerIdIn);
                    result.playerOut = this.soccerService.getTeam(data.name).getPlayer(replacemens[0].playerIdOut);
                }
                resolve(result);
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * @param {} data
     */
    extractTimeslot(data) {
        return {'name' : data.name};
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        return 'Last replacement';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return LastReplacementDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Last replacement';
    }

    /**
     * @return {string}
     */
    serviceNamespace () {
        return 'replacement';
    }

    /**
     * @param {Object} data
     * @param {TimeslotDataReference} dataReference
     * @return {Object}
     */
    extractMedatadaFromData(data, dataReference) {
        return dataReference.data.name;
    }
}

module.exports = LastReplacementDataInjector;