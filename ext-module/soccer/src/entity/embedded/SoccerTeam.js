const SoccerTeam = (async () => {
    
    const { GenericTeam } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/team/GenericTeam.js`));

    class SoccerTeam extends GenericTeam {
        constructor() {
            super();
      
            this.logo = {};
        }
    };

    return {SoccerTeam: SoccerTeam}
})();

export default SoccerTeam;
export const then = SoccerTeam.then.bind(SoccerTeam);



