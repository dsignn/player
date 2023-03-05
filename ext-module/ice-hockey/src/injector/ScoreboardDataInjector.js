const ScoreboardDataInjector = (async () => {

    const { AbstractInjector } = await import(
        `${container.get('Application').getBasePath()}module/timeslot/src/injector/AbstractInjector.js`);

    /**
    *
    */
    class ScoreboardDataInjector extends AbstractInjector {

        /**
         * @param {IceHockeyScoreboardService} iceHockeyScoreboardService 
         */
        constructor(iceHockeyScoreboardService) {
            super();

            this.hasData = false;

            /**
             * @type {iceHockeyScoreboardService}
             */
            this.iceHockeyScoreboardService = iceHockeyScoreboardService;
        }


        /**
         * @param {string} value
         * @return Promise
         */
        getServiceData(value) {
            return new Promise((resolve) => {
                resolve([this.iceHockeyScoreboardService.getMatch()]);
            });
        }

        /**
       * @param {Object} data
       * @return Promise
       */
        getTimeslotData(data) {
            return new Promise((resolve, reject) => {

                resolve(this.iceHockeyScoreboardService.getMatch());
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
            return 'Scoreboard ice hockey data';
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
            return 'Scoreboard ice hockey metadata';
        }

        get serviceNamespace() {
            return 'scoreboard';
        }
    }

    return {ScoreboardDataInjector: ScoreboardDataInjector};
})();

export default ScoreboardDataInjector;
export const then = ScoreboardDataInjector.then.bind(ScoreboardDataInjector);

