const ScoreboardSoccerDataInjector = (async () => {

    const { AbstractInjector } = await import(
        `${container.get('Application').getBasePath()}module/timeslot/src/injector/AbstractInjector.js`);

    /**
    *
    */
    class ScoreboardSoccerDataInjector extends AbstractInjector {

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
        getData(data) {
            return new Promise((resolve, reject) => {

                resolve(this.soccerScoreboardService.getMatch());
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
            return 'Scoreboard soccer data';
        }

        /**
         *  @return string
         */
        get serviceName() {
            return this.constructor.name;
        }

        /**
         *  @return string
         */
        get serviceDescription() {
            return 'Scoreboard soccer metadata';
        }

        get serviceNamespace() {
            return 'scoreboardSoccer';
        }
    }

    return {ScoreboardSoccerDataInjector: ScoreboardSoccerDataInjector};
})();

export default ScoreboardSoccerDataInjector;
export const then = ScoreboardSoccerDataInjector.then.bind(ScoreboardSoccerDataInjector);

