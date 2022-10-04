const IceHockeyScore = (async () => {

    const { EntityReference } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityReference.js`));
    const { GenericPeriod } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/match/GenericPeriod.js`));
    const { AbstractScore } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/score/AbstractScore.js`));
   
    /**
    * @class IceHockeyScore
    */
    class IceHockeyScore extends AbstractScore {
        constructor() {
            super();
      
            this.period = new GenericPeriod();
    
            this.time = null;
    
            this.playerReference = new EntityReference();
        }
    };

    return {IceHockeyScore: IceHockeyScore}

})();

export default IceHockeyScore;
export const then = IceHockeyScore.then.bind(IceHockeyScore);




