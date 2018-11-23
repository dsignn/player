
class LastCardsDataInjector extends AbstractInjector {

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
            let cards = this.soccerService.getTeam(data.name).getLastCardsOfPlayer();
            if (Array.isArray(cards)) {
                let result = {
                    cards :cards
                };

                if (cards.length > 0 ) {
                    result.player = this.soccerService.getTeam(data.name).getPlayer(cards[0].playerId);
                }

                resolve(result);
            }
            reject(cards);
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
        return 'Last cards';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return LastCardsDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Last cards';
    }

    /**
     *  @return string
     */
    serviceNamespace () {
        return 'player';
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

module.exports = LastCardsDataInjector;