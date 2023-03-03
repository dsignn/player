const ScoreboardDataInjector = (async () => {

    const { AbstractInjector } = await import(
        `${container.get('Application').getBasePath()}module/timeslot/src/injector/AbstractInjector.js`);

    /**
    *
    */
    class ScoreboardDataInjector extends AbstractInjector {

        /**
         * @param {SoccerScoreboardService} soccerScoreboardService 
         */
        constructor(soccerScoreboardService) {
            super();

            this.hasData = false;

            /**
             * @type {SoccerScoreboardService}
             */
            this.soccerScoreboardService = soccerScoreboardService;
        }


        /**
         * @param {string} value
         * @return Promise
         */
        getServiceData(value) {
            return new Promise((resolve) => {
                resolve([this.soccerScoreboardService.getMatch()]);
            });
        }

        /**
       * @param {Object} data
       * @return Promise
       */
        getTimeslotData(data) {
            return new Promise((resolve, reject) => {

                resolve(thissoccerScoreboardService.getMatch());
            });
        }

        /**
         * @param {Timer} timer
         */
        extractTimeslot(match) {
            return { 'id': match.id };
        }

        /**
         *  @return string
         */
        get serviceLabel() {
            return 'Scoreboard data';
        }

        /**
         *  @return string
         */
        get serviceName() {
            return ScoreboardDataInjector.name;
        }

        /**
         *  @return string
         */
        get serviceDescription() {
            return 'Scoreboard metadata';
        }

        get serviceNamespace() {
            return 'scoreboard';
        }
    }

    return {ScoreboardDataInjector: ScoreboardDataInjector};
})();

export default ScoreboardDataInjector;
export const then = ScoreboardDataInjector.then.bind(ScoreboardDataInjector);

