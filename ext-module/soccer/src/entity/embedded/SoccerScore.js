const SoccerScore = (async () => {

    const { EntityReference } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityReference.js`));
    const { GenericPeriod } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/match/GenericPeriod.js`));
    const { AbstractScore } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/score/AbstractScore.js`));
   
    /**
    * @class SoccerScore
    */
    class SoccerScore extends AbstractScore {
        constructor() {
            super();
      
            this.period = new GenericPeriod();
    
            this.time = null;
    
            this.playerReference = new EntityReference();
        }
    };

    return {SoccerScore: SoccerScore}

})();

export default SoccerScore;
export const then = SoccerScore.then.bind(SoccerScore);




