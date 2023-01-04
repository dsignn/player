const HelloWordService = (async () => {
    const { EventManagerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/event/EventManagerAware.js`));

    return {HelloWordService: class HelloWordService extends EventManagerAware {

    }};
})();

export default HelloWordService;
export const then = HelloWordService.then.bind(HelloWordService);