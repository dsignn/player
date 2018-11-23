
class BenchPlayersDataInjector extends AbstractInjector {

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
                let result = {
                    players : this.soccerService.getTeam(data.name).getPlayers({bench : true})
                };
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
        return 'Bench Players';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return BenchPlayersDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Bench playes';
    }

    /**
     * @return {string}
     */
    serviceNamespace () {
        return 'players';
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

module.exports = BenchPlayersDataInjector;