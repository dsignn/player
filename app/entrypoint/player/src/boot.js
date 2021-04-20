import {Container, ContainerAggregate} from '@dsign/library/src/container/index';
import {Application} from "@dsign/library/src/core/Application";
import {Module} from "@dsign/library/src/core/module/Module";
import {Listener} from '@dsign/library/src/event/index'
import {Storage} from '@dsign/library/src/storage/Storage';
import {EntityIdentifier, EntityNestedReference, EntityReference} from '@dsign/library/src/storage/entity/index';
import {WebComponent} from "@dsign/library/src/core/webcomponent/WebComponent";
import {AbstractHydrator, PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {HydratorStrategy} from "@dsign/library/src/hydrator/strategy/value/index";
import {mergeDeep} from "@dsign/library/src/object/Utils";
import {PathNode} from "@dsign/library/src/path/PathNode";
import {AutoLoadClass} from "@dsign/library/src/core/autoload/AutoLoadClass";
import {Widget} from "@dsign/library/src/core/widget/Widget";
import {Utils} from '@dsign/library/src/core/Utils';
import {Acl} from "@dsign/library/src/permission/acl/Acl";
import {JsAclAdapter} from "@dsign/library/src/permission/acl/adapter/js-acl/JsAclAdapter";

process.env.APP_ENVIRONMENT = process.env.APP_ENVIRONMENT === undefined ? 'production' : process.env.APP_ENVIRONMENT;

const fs = require('fs');
const path = require('path');
// when is compile generate the __dirname is different
const back = process.env.APP_ENVIRONMENT === 'development' ? '/../../../' : '/../../';

const basePath = path.normalize(`${__dirname}${back}`);
const packageJson =  JSON.parse(fs.readFileSync(`${basePath}${path.sep}package.json`).toString());
process.env.npm_package_name = process.env.npm_package_name ? process.env.npm_package_name : packageJson.name;
const homeData = Utils.getHomeDir(process.env);

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
 ACL
 ***********************************************************************************************************************/

const acl = new Acl(new JsAclAdapter(new window.JsAcl()));

acl.addRole('guest');
acl.addRole('admin');

acl.addResource('application');
acl.setRole('guest');
container.set('Acl', acl);

const application = new Application();
application.setBasePath(path.normalize(`${__dirname}${back}`))
    .setModulePath(`${basePath}module`)
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

let widgetHydrator = new PropertyHydrator(new Widget());
widgetHydrator.addValueStrategy('webComponent', new HydratorStrategy(webComponentHydrator));
widgetHydrator.addValueStrategy('webComponentData', new HydratorStrategy(webComponentHydrator));

let modules = JSON.parse(fs.readFileSync(`${basePath}${path.sep}config${path.sep}module.json`).toString());
let modulesHydrate = [];
let widgetHydrate = [];


for (let cont = 0; modules.length > cont; cont++) {
    modulesHydrate.push(moduleHydrator.hydrate(modules[cont]));
    if (modules[cont].widgets && Array.isArray(modules[cont].widgets) && modules[cont].widgets.length > 0) {

        for (let cont2 = 0; modules[cont].widgets.length > cont2; cont2++) {
            widgetHydrate.push(widgetHydrator.hydrate(modules[cont].widgets[cont2]));
        }
    }
}

application.getEventManager().on(
    Application.BOOTSTRAP_MODULE,
    new Listener( function(modules) {

        loadApplication();

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
container.set('EntityContainerAggregate', entityContainerAggregate);

entityContainerAggregate.set('EntityNestedReference', new EntityNestedReference());
entityContainerAggregate.set('EntityReference', new EntityReference());

/***********************************************************************************************************************
 * Sender container aggregate
 **********************************************************************************************************************/
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
//container.set('DexieManager', new DexieManager(config.storage.adapter.dexie.nameDb));



container.set('Timer',
    function (sm) {
        const Timer = require('easytimer.js').Timer;

        let timer =  new Timer();
        timer.start({precision: 'secondTenths'});
        return timer;

    });


/**
 * LOAD APPLICATION
 */
const loadApplication = () => {
    let wcApplication = window.document.createElement('paper-player-manager');
    window.document.body.appendChild(wcApplication);
};


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