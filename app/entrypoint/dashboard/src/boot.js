import {Archive} from '@dsign/library/src/archive/Archive';
import {Application2 as Application} from '@dsign/library/src/core/Application2';
import {Module} from '@dsign/library/src/core/module/Module';
import {Widget} from '@dsign/library/src/core/widget/Widget';
import {WebComponent} from '@dsign/library/src/core/webcomponent/WebComponent';
import {AutoLoadClass} from '@dsign/library/src/core/autoload/AutoLoadClass';
import {Listener} from '@dsign/library/src/event/index'
import {Container, ContainerAggregate} from  '@dsign/library/src/container/index';
import {Localize} from '@dsign/library/src/localize/Localize';
import {PathNode} from '@dsign/library/src/path/PathNode';
import {Acl} from '@dsign/library/src/permission/acl/Acl';
import {JsAclAdapter} from '@dsign/library/src/permission/acl/adapter/js-acl/JsAclAdapter';
import {Storage} from '@dsign/library/src/storage/Storage';
import {EntityIdentifier, EntityReference} from '@dsign/library/src/storage/entity/index';
import {EntityNestedReference} from '@dsign/library/src/storage/entity/EntityNestedReference';
import {PropertyHydrator, AbstractHydrator} from '@dsign/library/src/hydrator/index';
import {HydratorStrategy, PathStrategy} from '@dsign/library/src/hydrator/strategy/value/index';
import {MongoDb} from '@dsign/library/src/storage/adapter/mongo/index';
import {P2p} from '@dsign/library/src/net/index';
import {mergeDeep} from '@dsign/library/src/object/Utils';

let getHomeDir = (env) => {

    if (!env.HOME) {
        throw 'Dont set home directory in environment object';
    }

    if (!env.npm_package_name) {
        throw 'Dont set the name in the package json';
    }

    let directory;
    const os = require('os');
    const path = require('path');

    switch (os.type()) {
        case 'Linux':
            directory = `${env.HOME}${path.sep}.config${path.sep}${env.npm_package_name}`;
            break;
        case 'Darwin':
            directory = `${env.HOME}${path.sep}Library${path.sep}Application Support${path.sep}${env.npm_package_name}`;
            break;
        case 'Window_NT':
            directory = `${env.HOME}${path.sep}AppData${path.sep}Local${path.sep}${env.npm_package_name}`;
            break;
    }

    return directory;
}

process.env.APP_ENVIRONMENT = process.env.APP_ENVIRONMENT === undefined ? 'production' : process.env.APP_ENVIRONMENT;
process.env.npm_package_name = process.env.npm_package_name ? process.env.npm_package_name : packageJson.name;
const fs = require('fs');
const path = require('path');
// when is compile generate the __dirname is different
const back = process.env.APP_ENVIRONMENT === 'development' ? '/../../../' : '/../../';

const basePath = path.normalize(`${__dirname}${back}`);
const homeData = getHomeDir(process.env);
const packageJson =  JSON.parse(fs.readFileSync(`${basePath}${path.sep}package.json`).toString());
const config =  JSON.parse(
    fs.readFileSync(`${basePath}${path.sep}config${path.sep}config-${process.env.APP_ENVIRONMENT}.json`).toString()
);

/**
 * IMPORTANT add absolute node module path for web component script
 * TODO replace in application?
 */
require('app-module-path').addPath(`${basePath}${path.sep}node_modules`);

/***********************************************************************************************************************
 * Container
 * @type {ContainerInterface} container
 **********************************************************************************************************************/

const container = new Container();

/***********************************************************************************************************************
 * Merge
 * @type {mergeDeep} merge
 **********************************************************************************************************************/

const merge = {};
merge.merge = mergeDeep;
container.set('merge', merge);

/***********************************************************************************************************************
 * Application
 * @type {Application} application
 **********************************************************************************************************************/

const application = new Application();
application.setBasePath(path.normalize(`${__dirname}${back}`))
    .setModulePath(`${basePath}${path.sep}module`)
    .setResourcePath(`${homeData}${path.sep}resource`)
    .setStoragePath(`${homeData}${path.sep}storage`);

let pathHydrator = new PropertyHydrator(new PathNode());
let moduleHydrator = new PropertyHydrator(new Module());
let webComponentHydrator = new PropertyHydrator(new WebComponent());
webComponentHydrator.addValueStrategy('path',  new HydratorStrategy(pathHydrator));
let autoLoadClassHydrator = new PropertyHydrator(new AutoLoadClass());
autoLoadClassHydrator.addValueStrategy('path',new HydratorStrategy(pathHydrator));

moduleHydrator.addValueStrategy('autoloadsWs', new HydratorStrategy(webComponentHydrator));
moduleHydrator.addValueStrategy('entryPoint', new HydratorStrategy(webComponentHydrator));
moduleHydrator.addValueStrategy('autoloads', new HydratorStrategy(autoLoadClassHydrator));

let hydratorWidget = new PropertyHydrator(new Widget());
hydratorWidget.addValueStrategy('src', new PathStrategy());
hydratorWidget.addValueStrategy('srcData', new PathStrategy());

let modules = JSON.parse(fs.readFileSync(`${basePath}${path.sep}config${path.sep}module.json`).toString());
let modulesHydrate = [];
let widgetHydrate = [];


for (let cont = 0; modules.length > cont; cont++) {
    modulesHydrate.push(moduleHydrator.hydrate(modules[cont]));
    if (modules[cont].widgets && Array.isArray(modules[cont].widgets) && modules[cont].widgets.length > 0) {

        for (let cont2 = 0; modules[cont].widgets.length > cont2; cont2++) {
            widgetHydrate.push(hydratorWidget.hydrate(modules[cont].widgets[cont2]));
        }
    }
}

application.getEventManager().on(
    Application.BOOTSTRAP_MODULE,
    new Listener( function(modules) {

        container.get('MongoDb')
            .getEventManager()
            .on(
                MongoDb.READY_CONNECTION,
                (connection) =>  {
                    let appl = document.createElement('application-layout');
                    document.body.appendChild(appl);
                }
            );

        container.get('MongoDb').connect();

    }.bind(container))
);

application.setWidgets(widgetHydrate)
    .loadModules(modulesHydrate, container);

container.set('Application', application);

/***********************************************************************************************************************
 * Storage container aggregate
 **********************************************************************************************************************/

const storageContainerAggregate = new ContainerAggregate();
storageContainerAggregate.setPrototipeClass(Storage);
storageContainerAggregate.setContainer(container);
container.set('StorageContainerAggregate', storageContainerAggregate);

/***********************************************************************************************************************
 * Hydrator container aggregate
 **********************************************************************************************************************/

const hydratorContainerAggregate = new ContainerAggregate();
hydratorContainerAggregate.setPrototipeClass(AbstractHydrator);
hydratorContainerAggregate.setContainer(container);
container.set('HydratorContainerAggregate', hydratorContainerAggregate);

/***********************************************************************************************************************
 * Entity container aggregate
 **********************************************************************************************************************/

const entityContainerAggregate = new ContainerAggregate();
entityContainerAggregate.setPrototipeClass(EntityIdentifier);
entityContainerAggregate.setContainer(container);

entityContainerAggregate.set('EntityNestedReference', new EntityNestedReference());
entityContainerAggregate.set('EntityReference', new EntityReference());

container.set('EntityContainerAggregate', entityContainerAggregate);

/***********************************************************************************************************************
 * Sender container aggregate
 **********************************************************************************************************************/

const senderContainerAggregate = new ContainerAggregate();

// TODO review :)
senderContainerAggregate.setPrototipeClass((new Object).constructor);
senderContainerAggregate.setContainer(container);
container.set('SenderContainerAggregate', senderContainerAggregate);

senderContainerAggregate.set('Ipc', require('electron').ipcRenderer);

/***********************************************************************************************************************
 * Receiver container aggregate
 **********************************************************************************************************************/

const receiverContainerAggregate = new ContainerAggregate();
// TODO review :)
receiverContainerAggregate.setPrototipeClass((new Object).constructor);
receiverContainerAggregate.setContainer(container);
container.set('ReceiverContainerAggregate', receiverContainerAggregate);

receiverContainerAggregate.set('Ipc', require('electron').ipcRenderer);

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
                                            ACL
 ***********************************************************************************************************************/

const acl = new Acl(new JsAclAdapter(new window.JsAcl()));

acl.addRole('guest');
acl.addRole('admin');

acl.addResource('application');
acl.setRole('guest');

container.set('Acl', acl);

/***********************************************************************************************************************
                                            DEXIE MANAGER SERVICE
 **********************************************************************************************************************/

// container.set('DexieManager', new DexieManager(config.storage.adapter.dexie.nameDb));

/***********************************************************************************************************************
                                           MONGODB
 **********************************************************************************************************************/

container.set('MongoDb', new MongoDb(
        config.storage.adapter.mongo.name,
        config.storage.adapter.mongo.uri,
        config.storage.adapter.mongo.port,
{
            useUnifiedTopology: true,
            connectTimeoutMS: 60000,
        }
    )
);

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

let archive = new Archive(`${homeData}archive${path.sep}`);
//archive.appendDirectory(resourcePath, 'resource');
archive.setTmpDir(`${homeData}tmp${path.sep}`)
    .setResourceDir(application.getResourcePath())
    .setStorageContainer(container.get('StorageContainerAggregate'));

container.set('Archive', archive);

/***********************************************************************************************************************
                                        P2P
 **********************************************************************************************************************/

let p2p = new P2p(
    config.p2p.udpOption,
    config.p2p.clientOption,
    config.p2p.identifier
);
//p2p.runKeepAlive();

container.set('P2p', p2p);

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
