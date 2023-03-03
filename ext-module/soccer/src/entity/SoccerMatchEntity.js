const SoccerMatchEntity = (async () => {

    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));
    const { SoccerMatch } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/soccer/matchSoccer.js`));
    const { GenericPeriod } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/match/GenericPeriod.js`));
    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
    const {SoccerTeam } = await import('./embedded/Soccer.js');

    /**
    * @class SoccerMatchEntity
    */
    class SoccerMatchEntity extends EntityIdentifier {
        constructor() {
            super();
            this.periods = [
                new GenericPeriod('first'),
                new GenericPeriod('second'),
                new GenericPeriod('additional first half'),
                new GenericPeriod('additional second half')
            ];

            this.currentPeriod = new GenericPeriod('first');

            /**
             * @var TeamInteface
             */
            this.homeTeam = new SoccerTeam();
            /**
             * @var Array<ScoreInterface>
             */
            this.homeScores = [];
            /**
             * @var TeamInteface
             */
            this.guestTeam = new SoccerTeam();
            /**
             * @var Array<ScoreInterface>
             */
            this.guestScores = [];

            this.time = new Time();
        }
    };

    /**
     * Custom inheritance
     */
    let functions = Object.getOwnPropertyNames(SoccerMatch.prototype);
    functions.forEach(function (method) {
        if (method !== 'constructor') {
            SoccerMatchEntity.prototype[method] = SoccerMatch.prototype[method];
        }
    });

    functions = Object.getOwnPropertyNames(SoccerMatch.prototype.__proto__);
    functions.forEach(function (method) {
        if (method !== 'constructor') {
            SoccerMatchEntity.prototype[method] = SoccerMatch.prototype.__proto__[method];
        }
    });

    return {SoccerMatchEntity: SoccerMatchEntity};
})();

export default SoccerMatchEntity;
export const then = SoccerMatchEntity.then.bind(SoccerMatchEntity);


