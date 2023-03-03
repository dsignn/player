const SoccerPlayerEntity = (async () => {
    
    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));
    const { GenericPlayer } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sport/player/GenericPlayer.js`));

    class SoccerPlayerEntity extends EntityIdentifier { };

    /**
     * Custom inheritance
     */
    let functions = Object.getOwnPropertyNames(GenericPlayer.prototype);
    functions.forEach(function (method) {
        SoccerPlayerEntity.prototype[method] = GenericPlayer.prototype[method];
    });

    return {SoccerPlayerEntity: SoccerPlayerEntity};
})();

export default SoccerPlayerEntity;
export const then = SoccerPlayerEntity.then.bind(SoccerPlayerEntity);

