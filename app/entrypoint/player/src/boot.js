import {Container, ContainerAggregate} from  '@dsign/library/src/container/index';
import {Application} from "@dsign/library/src/core/Application";
import {PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {Module} from "@dsign/library/src/core/module/Module";
import {DexieManager} from "@dsign/library/src/storage/adapter/dexie/index";

process.env.APP_ENVIRONMENT = process.env.APP_ENVIRONMENT === undefined ? 'production' : process.env.APP_ENVIRONMENT;
const fs = require('fs');
const path = require('path');
const back = process.env.APP_ENVIRONMENT === 'development' ? '/../../../' : '/../../../';

const basePath = path.normalize(`${__dirname}${back}`);
const modulePath = path.normalize(`${__dirname}${back}module${path.sep}`);
const resourcePath = path.normalize(`${__dirname}${back}${path.sep}..${path.sep}storage${path.sep}resource${path.sep}`);

const config = JSON.parse(
    fs.readFileSync(`${basePath}config${path.sep}config-${process.env.APP_ENVIRONMENT}.json`).toString()
);

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
storageContainerAggregate.setPrototipeClass(require("@dsign/library").storage.Storage);
storageContainerAggregate.setContainer(container);
container.set('StorageContainerAggregate', storageContainerAggregate);

const hydratorContainerAggregate = new ContainerAggregate();
hydratorContainerAggregate.setPrototipeClass(require("@dsign/library").hydrator.AbstractHydrator);
hydratorContainerAggregate.setContainer(container);
container.set('HydratorContainerAggregate', hydratorContainerAggregate);

const entityContainerAggregate = new ContainerAggregate();
entityContainerAggregate.setPrototipeClass(require("@dsign/library").storage.entity.EntityIdentifier);
entityContainerAggregate.setContainer(container);
container.set('EntityContainerAggregate', entityContainerAggregate);

entityContainerAggregate.set(
    'EntityNestedReference',
    new (require("@dsign/library").storage.entity.EntityNestedReference)()
);


entityContainerAggregate.set(
    'EntityReference',
    new (require("@dsign/library").storage.entity.EntityReference)()
);

const senderContainerAggregate = new ContainerAggregate();
// TODO review :)
senderContainerAggregate.setPrototipeClass((new Object).constructor);
senderContainerAggregate.setContainer(container);
container.set('SenderContainerAggregate', senderContainerAggregate);


const receiverContainerAggregate = new ContainerAggregate();
// TODO review :)
receiverContainerAggregate.setPrototipeClass((new Object).constructor);
receiverContainerAggregate.setContainer(container);
container.set('ReceiverContainerAggregate', receiverContainerAggregate);

/***********************************************************************************************************************
                                                CONFIG SERVICE
 **********************************************************************************************************************/
container.set('Config', config);


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
