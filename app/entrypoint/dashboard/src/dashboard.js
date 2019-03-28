import {Application} from '@p3e/library/src/core/Application';
import {Module} from '@p3e/library/src/core/module/Module';
import {Listener} from '@p3e/library/src/event/index'
import {Container, ContainerAggregate} from  '@p3e/library/src/container/index';
import {Localize} from '@p3e/library/src/localize/Localize';
import {PropertyHydrator, Abstr} from '@p3e/library/src/hydrator/index';
import {DexieManager} from '@p3e/library/src/storage/adapter/dexie/index';

process.env.APP_ENVIRONMENT = process.env.APP_ENVIRONMENT === undefined ? 'production' : process.env.APP_ENVIRONMENT;
const fs = require('fs');
const path = require('path');
const back = process.env.APP_ENVIRONMENT === 'development' ? '/../../../' : '/../../';

const basePath = path.normalize(`${__dirname}${back}`);
const modulePath = path.normalize(`${__dirname}${back}module${path.sep}`);
const resourcePath = path.normalize(`${__dirname}${back}storage${path.sep}`);

/**
 * Container service of application
 *
 * @type {Container}
 */
const container = new Container();
/**
 * Inject general container aggregate service
 */
const storageContainerAggregate = new ContainerAggregate();
storageContainerAggregate.setPrototipeClass(require("@p3e/library").storage.Storage);
storageContainerAggregate.setContainer(container);
container.set('StorageContainerAggregate', storageContainerAggregate);

const hydratorContainerAggregate = new ContainerAggregate();
hydratorContainerAggregate.setPrototipeClass(require("@p3e/library").hydrator.AbstractHydrator);
hydratorContainerAggregate.setContainer(container);
container.set('HydratorContainerAggregate', hydratorContainerAggregate);

const entityContainerAggregate = new ContainerAggregate();
entityContainerAggregate.setPrototipeClass(require("@p3e/library").storage.entity.EntityIdentifier);
entityContainerAggregate.setContainer(container);
container.set('EntityContainerAggregate', entityContainerAggregate);


const config =  JSON.parse(
    fs.readFileSync(`${basePath}config${path.sep}config-${process.env.APP_ENVIRONMENT}.json`).toString()
);
/***********************************************************************************************************************
                                               CONFIG SERVICE
***********************************************************************************************************************/
container.set('Config', config);

/***********************************************************************************************************************
                                              LOCALIZE SERVICE
 ***********************************************************************************************************************/
container.set('Localize', new Localize(
    config.localize.defaultLanguage,
    config.localize.languages
));

/***********************************************************************************************************************
                                            DEXIE MANAGER SERVICE
 **********************************************************************************************************************/
container.set('DexieManager', new DexieManager(config.storage.adapter.dexie.nameDb));

/***********************************************************************************************************************
                                             APPLICATION SERVICE
 **********************************************************************************************************************/
let hydrator = new PropertyHydrator(new Module());
let modules = JSON.parse(fs.readFileSync(`${basePath}config${path.sep}module.json`).toString());
let modulesHydrate = [];
for (let cont = 0; modules.length > cont; cont++) {
    modulesHydrate.push(hydrator.hydrate(modules[cont]));
}

const application = new Application();

application.getEventManager().on(
    Application.BOOTSTRAP_MODULE,
    new Listener( function(modules) {

        this.get('DexieManager').generateSchema();
        this.get('DexieManager').open();
    }.bind(container))
);

application.setBasePath(basePath)
    .setModulePath(modulePath)
    .setResourcePath(resourcePath)
    .loadModules(modulesHydrate, container);

container.set('Application', application);

/**
 * Load application in global scope
 */
switch (true) {
    case  typeof window !== 'undefined':

        Object.defineProperty(window, 'container', {
            value: container,
            writable: false
        });

        break;
    case  typeof global !== 'undefined':

        Object.defineProperty(global, 'container', {
            value: container,
            writable: false
        });

        break;
    default:
        throw 'wrong context';
}