import {config} from './config';
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {Store} from "@dsign/library/src/storage/adapter/dexie/Store";
import {DexieMonitorAdapter} from "./src/storage/adapter/dexie/DexieMonitorAdapter";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/PropertyHydrator";
import {
    HybridStrategy,
    HydratorStrategy,
    MongoIdStrategy,
    NumberStrategy
} from "@dsign/library/src/hydrator/strategy/value/index";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {ProxyIpc} from "@dsign/library/src/sender/ProxyIpc";
import {MonitorEntity} from "./src/entity/MonitorEntity";
import {MonitorContainerEntity} from "./src/entity/MonitorContainerEntity";
import {MonitorService} from "./src/MonitorService";
import {ProxyConfigMonitorService} from "./src/ProxyConfigMonitorService";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     *
     */
    init() {
        this.initConfig();
        this.initAcl();
        this.initEntity();
        this.initSender();
        this.initReceiver();
        this.initHydrator();
        this.initDexieStorage();
        this.initMonitorMetaId();
    }

    /**
     * @returns Object
     */
    _getModuleConfig() {
        return  this.getContainer().get('ModuleConfig')['monitor']['monitor'];
    }

    /**
     * Merge config
     */
    initConfig() {
        this.container.set(
            'ModuleConfig',
            this.getContainer().get('merge').merge(this.getContainer().get('ModuleConfig'), config)
        );
    }

    /**
     *
     */
    initDexieStorage() {

        const dexieManager = this.getContainer().get(
            this._getModuleConfig().storage.adapter.dexie['connection-service']
        );

        /**
         * Add schema
         */
        let store = new Store(
            this._getModuleConfig().storage.adapter.dexie['collection'], 
            [
                "++id", 
                "name", 
                "enable"
            ]
        );

        dexieManager.addStore(store);

        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {

            const adapter = new DexieMonitorAdapter(
                dexieManager, 
                this._getModuleConfig().storage.adapter.dexie['collection']
            );
            const storage = new Storage(adapter);
            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['name-storage-service-monitor-container']
                )
            );

            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig().storage['name-service'],
                storage
            );

            let dashboardAlwayOnTop = this.getContainer().get('Config').dashboard &&  this.getContainer().get('Config').dashboard.alwaysOnTop ?
                this.getContainer().get('Config').dashboard.alwaysOnTop : false;

            this.getContainer().set(
                'MonitorService',
                new MonitorService(
                    storage,
                    this.getContainer().get('SenderContainerAggregate').get(this._getModuleConfig().monitorSender),
                    this.getContainer().get('ReceiverContainerAggregate').get(this._getModuleConfig().monitorReceiver),
                    dashboardAlwayOnTop
                )
            )
        });
    }

    initMonitorMetaId() {

        this.getContainer()
            .set( 
                'ProxyConfigMonitorService', 
                new ProxyConfigMonitorService(
                    this.getContainer().get('SenderContainerAggregate').get('ApplicationSender'),
                    this.getContainer().get('ReceiverContainerAggregate').get(this._getModuleConfig().monitorReceiver)
                )
            );
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoMonitorAdapter(
                this.getContainer().get(this._getModuleConfig().storage.adapter.mongo['connection-service']), 
                this._getModuleConfig().storage.adapter.mongo['collection']
            );
            const storage = new Storage(adapter);

            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['name-storage-service-monitor-container']
                )
            );

            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig().storage['name-service'], 
                storage
            );

            let dashboardAlwayOnTop =  this.getContainer().get('Config').dashboard &&  this.getContainer().get('Config').dashboard.alwaysOnTop ?
                this.getContainer().get('Config').dashboard.alwaysOnTop : false;

            this.getContainer().set(
                'MonitorService',
                new MonitorService(
                    storage,
                    this.getContainer().get('SenderContainerAggregate').get(this._getModuleConfig().monitorSender),
                    this.getContainer().get('ReceiverContainerAggregate').get(this._getModuleConfig().monitorReceiver),
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
            .set(
                this._getModuleConfig.entityService,
                new MonitorContainerEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig.entityServiceWrapper, 
                new MonitorEntity()
            );
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service-monitor-container'],
                Repository.getMonitorContainerEntityHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service-monitor'],
                Repository.getMonitorEntityHydrator(this.getContainer())
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
                this._getModuleConfig().monitorSender,
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
                this._getModuleConfig().monitorReceiver,
                require('electron').ipcRenderer
            );
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');
            let resource = this._getModuleConfig().acl.resource;

            // TODO add method on service
            aclService.addResource(resource);
            aclService.allow('guest', resource);
        }
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getMonitorContainerEntityHydrator(container) {
        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['monitor']['monitor'].entityService
            )
        );

        let strategy = new HydratorStrategy();
        strategy.setHydrator(Repository.getMonitorEntityHydrator(container));

        // COMMENT to run without mongo
        hydrator
            //.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            //.addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', 'id'));
            

        //hydrator.addValueStrategy('id', new MongoIdStrategy())
        //    .addValueStrategy('_id', new MongoIdStrategy())
        hydrator.addValueStrategy('monitors', strategy)
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

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['monitor']['monitor'].entityServiceWrapper
            )
        );
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
        hydrator.setTemplateObjectHydration(
            container.get('EntityContainerAggregate').get('EntityNestedReference')
        );

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
        hydrator.setTemplateObjectHydration(
            container.get('EntityContainerAggregate').get('EntityReference')
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name');

        return hydrator;
    }
}
