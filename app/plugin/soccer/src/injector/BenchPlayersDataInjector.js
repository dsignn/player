
class BenchPlayersDataInjector extends AbstractInjector {

    constructor(soccerService) {
        super();

        this.selectData = [
            {name: SoccerService.HOME_TEAM},
            {name: SoccerService.GUEST_TEAM}
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
            let players = this.soccerService.getTeam(data.name).getPlayers({bench : true});
            if (Array.isArray(players)) {
                resolve(players);
            }
            reject(player);
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

    serviceNamespace () {
        return 'players';
    }
}

module.exports = BenchPlayersDataInjector;