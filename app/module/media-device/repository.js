import {config} from './config';
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {Store} from "@dsign/library/src/storage/adapter/dexie/Store";
import {DexieMonitorAdapter} from "./src/storage/adapter/dexie/DexieMonitorAdapter";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/PropertyHydrator";
import {HydratorStrategy, NumberStrategy, MongoIdStrategy, HybridStrategy} from "@dsign/library/src/hydrator/strategy/value/index";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {ProxyIpc} from "@dsign/library/src/sender/ProxyIpc";
import {MonitorEntity} from "./src/entity/MonitorEntity";
import {MonitorContainerEntity} from "./src/entity/MonitorContainerEntity";
import {MonitorService} from "./src/MonitorService";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'monitor'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'MonitorStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_CONTAINER_ENTITY_SERVICE() { return 'MonitorContainerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_ENTITY_SERVICE() { return 'MonitorEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_CONTAINER_HYDRATOR_SERVICE() { return 'MonitorContaninerEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_HYDRATOR_SERVICE() { return 'MonitorEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_SENDER_SERVICE() { return 'MonitorSender'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_RECEIVER_SERVICE() { return 'MonitorReceiver'; };

    /**
     *
     */
    init() {
        this.loadConfig();
        this.initAcl();
        this.initEntity();
        this.initSender();
        this.initReceiver();
        this.initHydrator();
        this.initMongoStorage();
    }

    /**
     * Merge config
     */
    loadConfig() {
        this.container.set(
            'config',
            this.getContainer().get('merge').merge(config, this.getContainer().get('config'))
        );
    }

    /**
     *
     */
    initDexieStorage() {

        const dexieManager = this.getContainer().get('DexieManager');

        /**
         * Add schema
         */
        let store = new Store(Repository.COLLECTION, ["++id", "name", "enable"]);
        dexieManager.addStore(store);

        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {

            const adapter = new DexieMonitorAdapter(dexieManager, Repository.COLLECTION);
            const storage = new Storage(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.MONITOR_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
                storage
            );

            let dashboardAlwayOnTop = this.getContainer().get('Config').dashboard &&  this.getContainer().get('Config').dashboard.alwaysOnTop ?
                this.getContainer().get('Config').dashboard.alwaysOnTop : false;

            this.getContainer().set(
                'MonitorService',
                new MonitorService(
                    storage,
                    this.getContainer().get('SenderContainerAggregate').get(Repository.MONITOR_SENDER_SERVICE),
                    dashboardAlwayOnTop
                )
            )
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoMonitorAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.MONITOR_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(Repository.STORAGE_SERVICE, storage);

            let dashboardAlwayOnTop =  this.getContainer().get('Config').dashboard &&  this.getContainer().get('Config').dashboard.alwaysOnTop ?
                this.getContainer().get('Config').dashboard.alwaysOnTop : false;

            this.getContainer().set(
                'MonitorService',
                new MonitorService(
                    storage,
                    this.getContainer().get('SenderContainerAggregate').get(Repository.MONITOR_SENDER_SERVICE),
                    dashboardAlwayOnTop
                )
            )
        };


        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(
                MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.MONITOR_CONTAINER_ENTITY_SERVICE, new MonitorContainerEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.MONITOR_ENTITY_SERVICE, new MonitorEntity());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.MONITOR_CONTAINER_HYDRATOR_SERVICE,
                Repository.getMonitorContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.MONITOR_HYDRATOR_SERVICE,
                Repository.getMonitorEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            )
    }

    /**
     *
     */
    initSender() {

        let sender = new ProxyIpc(this.getContainer().get('Config').sender.ipcProxy.proxyName);

        this.getContainer()
            .get('SenderContainerAggregate')
            .set(
                Repository.MONITOR_SENDER_SERVICE,
                sender
            );
    }

    /**
     *
     */
    initReceiver() {
        this.getContainer()
            .get('ReceiverContainerAggregate')
            .set(
                Repository.MONITOR_RECEIVER_SERVICE,
                require('electron').ipcRenderer
            );
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.addResource('monitor');
            aclService.allow('guest', 'monitor');
        }
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getMonitorContainerEntityHydrator(container) {
        let hydrator = new PropertyHydrator(container.get(Repository.MONITOR_CONTAINER_ENTITY_SERVICE));

        let strategy = new HydratorStrategy();
        strategy.setHydrator(Repository.getMonitorEntityHydrator(container));

        hydrator.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'));

        hydrator.addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy())
            .addValueStrategy('monitors', strategy)
            .addValueStrategy('enable', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE));

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('enable')
            .enableExtractProperty('monitors');

        hydrator.enableHydrateProperty('id')

            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('monitors');

        return hydrator;
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getMonitorEntityHydrator(container) {

        let hydrator = new PropertyHydrator(container.get(Repository.MONITOR_ENTITY_SERVICE));
        let strategy = new HydratorStrategy();
        strategy.setHydrator(hydrator);

        hydrator.addValueStrategy('monitors', strategy)
            .addValueStrategy('polygonPoints',  new HydratorStrategy(Repository.getPointHydrator(container)))
            .addValueStrategy('defaultTimeslotReference', new HydratorStrategy(Repository.getTimeslotReferenceHydrator(container)))
            .addValueStrategy('alwaysOnTop', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE))
            .addValueStrategy('offsetX', new NumberStrategy())
            .addValueStrategy('offsetY', new NumberStrategy())
            .addValueStrategy('height', new NumberStrategy())
            .addValueStrategy('width', new NumberStrategy());

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('backgroundColor')
            .enableExtractProperty('polygonPoints')
            .enableExtractProperty('monitors')
            .enableExtractProperty('alwaysOnTop')
            .enableExtractProperty('defaultTimeslotReference');


        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('backgroundColor')
            .enableHydrateProperty('polygonPoints')
            .enableHydrateProperty('monitors')
            .enableHydrateProperty('alwaysOnTop')
            .enableHydrateProperty('defaultTimeslotReference');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getMonitorContainerReferenceHydrator(container) {

        let hydrator = new PropertyHydrator();
        hydrator.setTemplateObjectHydration(container.get('EntityNestedReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name')
            .enableHydrateProperty('parentId');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name')
            .enableExtractProperty('parentId');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getPointHydrator(container) {

        let hydrator = new PropertyHydrator();
        hydrator.addValueStrategy('x', new NumberStrategy())
            .addValueStrategy('y', new NumberStrategy());

        hydrator.enableHydrateProperty('x')
            .enableHydrateProperty('y');

        hydrator.enableExtractProperty('x')
            .enableExtractProperty('y');

        return hydrator;
    }


    /**
     * @param container
     * @return {PropertyHydrator}
     * TODO monitor confi is loaded before
     */
    static getTimeslotReferenceHydrator(container) {

        let hydrator = new PropertyHydrator();
        hydrator.setTemplateObjectHydration(container.get('EntityReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name');

        return hydrator;
    }
}
