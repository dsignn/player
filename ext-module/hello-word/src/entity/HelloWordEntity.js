const HelloWordEntity = (async () => {
    const { EntityIdentifier} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    return {HelloWordEntity: class HelloWordEntity extends EntityIdentifier {

    }};
})();

export default HelloWordEntity;
export const then = HelloWordEntity.then.bind(HelloWordEntity);