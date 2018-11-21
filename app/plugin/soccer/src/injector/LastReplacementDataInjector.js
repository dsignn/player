
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
            let players = this.soccerService.getTeam(data.name).replacemens;
            if (Array.isArray(players)) {
                resolve(players);
            }
            reject(players);
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
        return 'players';
    }
}

module.exports = LastReplacementDataInjector;