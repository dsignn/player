
class HomePlayerDataInjector extends AbstractInjector {

    constructor(soccerService) {
        super();

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
            let players = this.soccerService.getTeam(MatchSoccer.HOME_TEAM).getPlayers({surname :  value});
            if (Array.isArray(players)) {
                resolve(players);
            }
            reject(players);
        });
    }

    /**
     * @param {Object} data
     * @return Promise
     */
    getTimeslotData(data) {
        return new Promise((resolve, reject) => {
            let player = this.soccerService.getPlayer(MatchSoccer.HOME_TEAM, data.id);
            if (player) {
                let result = {};
                result[this.serviceNamespace()] = player;
                resolve(result);
            }
            reject(player);
        });
    }

    /**
     * @param {Player} player
     */
    extractTimeslot(player) {
        return {'id' : player.id};
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        return 'Home player';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return HomePlayerDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Home player';
    }

    serviceNamespace () {
        return 'player';
    }

    getTextProperty() {
        return 'surname';
    }
}

module.exports = HomePlayerDataInjector;