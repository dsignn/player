import {Container, ContainerAggregate} from  '@dsign/library/src/container/index';
import {Application} from "@dsign/library/src/core/Application";
import {PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {Module} from "@dsign/library/src/core/module/Module";
import {DexieManager} from "@dsign/library/src/storage/adapter/dexie/index";
import {WebComponent} from "@dsign/library/src/core/webcomponent/WebComponent";
import {HydratorStrategy, PathStrategy} from "@dsign/library/src/hydrator/strategy/value/index";

process.env.APP_ENVIRONMENT = process.env.APP_ENVIRONMENT === undefined ? 'production' : process.env.APP_ENVIRONMENT;
const fs = require('fs');
const path = require('path');
// when is compile generate the __dirname is different
const back = process.env.APP_ENVIRONMENT === 'development' ? '/../../../' : '/../../';
const basePath = path.normalize(`${__dirname}${back}`);
const modulePath = path.normalize(`${__dirname}${back}module${path.sep}`);
const packageJson =  JSON.parse(fs.readFileSync(`${basePath}${path.sep}package.json`).toString());
process.env.npm_package_name = process.env.npm_package_name ? process.env.npm_package_name : packageJson.name;

const applicationDataPath = Application.getHomeApplicationDataDir(process.env);
Application.createDirectories(applicationDataPath);
const storagePath = path.normalize(`${applicationDataPath}${path.sep}storage${path.sep}`);
const resourcePath = path.normalize(`${applicationDataPath}${path.sep}storage${path.sep}resource${path.sep}`);

/**
 * Container service of application
 * @type {Container}
 */
const container = new Container();

/**
 * @type {Application}
 */
const application = new Application();
application.setBasePath(basePath)
    .setModulePath(modulePath)
    .setResourcePath(resourcePath);

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

const config = JSON.parse(
    fs.readFileSync(`${basePath}${path.sep}config${path.sep}config-${process.env.APP_ENVIRONMENT}.json`).toString()
);

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

let hydratorWebComponent = new PropertyHydrator(new WebComponent());
hydratorWebComponent.addValueStrategy('path',  new PathStrategy());

let hydratorModule = new PropertyHydrator(new Module());
hydratorModule.addValueStrategy('autoloadsWs', new HydratorStrategy(hydratorWebComponent));
hydratorModule.addValueStrategy('entryPoint', new HydratorStrategy(hydratorWebComponent));

let modules = JSON.parse(fs.readFileSync(`${basePath}config${path.sep}module.json`).toString());
let modulesHydrate = [];
for (let cont = 0; modules.length > cont; cont++) {
    modulesHydrate.push(hydratorModule.hydrate(modules[cont]));
}

application.getEventManager().on(
    Application.BOOTSTRAP_MODULE,
    (evt) => {

        let appl = document.createElement('paper-player-manager');

        if (document.body) {
            document.body.appendChild(appl);
        } else {
            window.addEventListener('load', (event) => {
                document.body.appendChild(appl);
            });
        }
    }
);

application.loadModules(modulesHydrate, container);

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
