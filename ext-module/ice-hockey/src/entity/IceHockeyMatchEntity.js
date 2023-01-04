const IceHockeyMatchEntity = (async () => {

    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));
    const { IceHockeyMatch } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/ice-hockey/match/IceHockeyMatch.js`));
    const { GenericPeriod } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/match/GenericPeriod.js`));
    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
    const { IceHockeyTeam } = await import('./embedded/IceHockeyTeam.js');

    /**
    * @class IceHockeyMatchEntity
    */
    class IceHockeyMatchEntity extends EntityIdentifier {
        constructor() {
            super();
            this.periods = [
                new GenericPeriod('first'),
                new GenericPeriod('second'),
                new GenericPeriod('third')
            ];

            this.currentPeriod = new GenericPeriod('first');

            /**
             * @var TeamInteface
             */
            this.homeTeam = new IceHockeyTeam();
            /**
             * @var Array<ScoreInterface>
             */
            this.homeScores = [];
            /**
             * @var TeamInteface
             */
            this.guestTeam = new IceHockeyTeam();
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
    let functions = Object.getOwnPropertyNames(IceHockeyMatch.prototype);
    functions.forEach(function (method) {
        if (method !== 'constructor') {
            IceHockeyMatchEntity.prototype[method] = IceHockeyMatch.prototype[method];
        }
    });

    functions = Object.getOwnPropertyNames(IceHockeyMatch.prototype.__proto__);
    functions.forEach(function (method) {
        if (method !== 'constructor') {
            IceHockeyMatchEntity.prototype[method] = IceHockeyMatch.prototype.__proto__[method];
        }
    });

    return {IceHockeyMatchEntity: IceHockeyMatchEntity};
})();

export default IceHockeyMatchEntity;
export const then = IceHockeyMatchEntity.then.bind(IceHockeyMatchEntity);


