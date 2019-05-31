import {Application} from '@dsign/library/src/core/Application';
import {Archive} from '@dsign/library/src/archive/Archive';
import {Module} from '@dsign/library/src/core/module/Module';
import {Widget} from '@dsign/library/src/core/widget/Widget';
import {Listener} from '@dsign/library/src/event/index'
import {Container, ContainerAggregate} from  '@dsign/library/src/container/index';
import {Localize} from '@dsign/library/src/localize/Localize';
import {PropertyHydrator} from '@dsign/library/src/hydrator/index';
import {HydratorStrategy, PathStrategy} from '@dsign/library/src/hydrator/strategy/value/index';
import {DexieManager} from '@dsign/library/src/storage/adapter/dexie/index';

process.env.APP_ENVIRONMENT = process.env.APP_ENVIRONMENT === undefined ? 'production' : process.env.APP_ENVIRONMENT;
const fs = require('fs');
const path = require('path');
const back = process.env.APP_ENVIRONMENT === 'development' ? '/../../../' : '/../../';
const basePath = path.normalize(`${__dirname}${back}`);
const modulePath = path.normalize(`${__dirname}${back}module${path.sep}`);
const storagePath = path.normalize(`${__dirname}${back}${path.sep}..${path.sep}storage${path.sep}`);
const resourcePath = path.normalize(`${__dirname}${back}${path.sep}..${path.sep}storage${path.sep}resource${path.sep}`);
const resourceConfig = path.normalize(`${basePath}${path.sep}config${path.sep}`);

if (!fs.existsSync(resourcePath)) {
    try {
        fs.mkdirSync(`${basePath}..${path.sep}storage`);
        fs.mkdirSync(`${basePath}..${path.sep}storage${path.sep}resource`);
        fs.mkdirSync(`${basePath}..${path.sep}storage${path.sep}archive`);
        fs.mkdirSync(`${basePath}..${path.sep}storage${path.sep}tmp`);
    } catch (e) {
        console.error(err);
    }
}
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

const config =  JSON.parse(
    fs.readFileSync(`${basePath}${path.sep}config${path.sep}config-${process.env.APP_ENVIRONMENT}.json`).toString()
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
                                            NOTIFICATION SERVICE
 **********************************************************************************************************************/

container.set('Notify', {
    notify:  (text) => {

        let id = 'notification';
        let paperToast = document.getElementById(id);
        if (!paperToast) {
            console.warn('Element by id ' + id + ' not found');
            return;
        }

        // TODO inject Translator
        paperToast.text = text;
        paperToast.open();
    }
});

/***********************************************************************************************************************
                                            ARCHIVE SERVICE
 **********************************************************************************************************************/

let archive = new Archive(`${storagePath}archive${path.sep}`);
archive.appendDirectory(resourcePath, 'resource');
archive.setTmpDir(`${storagePath}tmp${path.sep}`)
    .setResourceDir(resourcePath)
    .setStorageContainer(container.get('StorageContainerAggregate'));

container.set('Archive', archive);

/***********************************************************************************************************************
 APPLICATION SERVICE
 **********************************************************************************************************************/

container.set('Timer',
    function (sm) {
        const Timer = require('easytimer.js').Timer;

        let timer =  new Timer();
        timer.start({precision: 'secondTenths'});
        return timer;

    });


/***********************************************************************************************************************
                                             APPLICATION SERVICE
 **********************************************************************************************************************/
let hydratorModule = new PropertyHydrator(new Module());
let hydratorWidget = new PropertyHydrator(new Widget());

let strategy = new PathStrategy();
hydratorWidget.addValueStrategy('src', strategy);
hydratorWidget.addValueStrategy('srcData', strategy);

let modules = JSON.parse(fs.readFileSync(`${basePath}${path.sep}config${path.sep}module.json`).toString());
let modulesHydrate = [];
let widgetHydrate = [];

for (let cont = 0; modules.length > cont; cont++) {
    modulesHydrate.push(hydratorModule.hydrate(modules[cont]));
    if (modules[cont].widgets && Array.isArray(modules[cont].widgets) && modules[cont].widgets.length > 0) {

        for (let cont2 = 0; modules[cont].widgets.length > cont2; cont2++) {
            widgetHydrate.push(hydratorWidget.hydrate(modules[cont].widgets[cont2]));
        }
    }
}

const application = new Application();

application.getEventManager().on(
    Application.BOOTSTRAP_MODULE,
    new Listener( function(modules) {

        this.get('DexieManager').on("ready", () => {
            let appl = document.createElement('dsign-layout');
            appl.section = 'resource';
            document.body.appendChild(appl);
        });

        this.get('DexieManager').generateSchema();
        this.get('DexieManager').open();
    }.bind(container))
);

application.setBasePath(basePath)
    .setModulePath(modulePath)
    .setWidgets(widgetHydrate)
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
