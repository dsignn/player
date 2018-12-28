/**
 *
 */
class LastGoalDataInjector extends AbstractInjector {

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
                let goal = this.soccerService.match.getLastGoal(data.name);
                let player = this.soccerService.match.getPlayerFromGoal(data.name, goal);
                resolve({goal: goal, player : player});
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
        return 'Last goal';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return LastGoalDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Last goal';
    }

    /**
     *  @return string
     */
    serviceNamespace () {
        return 'data';
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

module.exports = LastGoalDataInjector;