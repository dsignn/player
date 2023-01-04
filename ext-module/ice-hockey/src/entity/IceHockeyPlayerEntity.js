const IceHockeyPlayerEntity = (async () => {
    
    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));
    const { GenericPlayer } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/player/GenericPlayer.js`));

    class IceHockeyPlayerEntity extends EntityIdentifier { };

    /**
     * Custom inheritance
     */
    let functions = Object.getOwnPropertyNames(GenericPlayer.prototype);
    functions.forEach(function (method) {
        IceHockeyPlayerEntity.prototype[method] = GenericPlayer.prototype[method];
    });

    return {IceHockeyPlayerEntity: IceHockeyPlayerEntity};
})();

export default IceHockeyPlayerEntity;
export const then = IceHockeyPlayerEntity.then.bind(IceHockeyPlayerEntity);

