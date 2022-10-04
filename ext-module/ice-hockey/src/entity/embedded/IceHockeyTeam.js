const IceHockeyTeam = (async () => {
    
    const { GenericTeam } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/team/GenericTeam.js`));

    class IceHockeyTeam extends GenericTeam {
        constructor() {
            super();
      
            this.logo = {};
        }
    };

    return {IceHockeyTeam: IceHockeyTeam}
})();

export default IceHockeyTeam;
export const then = IceHockeyTeam.then.bind(IceHockeyTeam);



