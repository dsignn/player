import {config} from './config';
import {ContainerAggregate, ContainerAware} from "@dsign/library/src/container/index";
import {Store} from "@dsign/library/src/storage/adapter/dexie/Store";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {
    HybridStrategy,
    HydratorStrategy,
    MongoIdStrategy,
    NumberStrategy
} from "@dsign/library/src/hydrator/strategy/value/index";
import {MongoIdGenerator} from "@dsign/library/src/storage/util/MongoIdGenerator";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {AbstractInjector} from "./src/injector/AbstractInjector";
import {Test1} from "./src/injector/Test1";
import {Test2} from "./src/injector/Test2";
import {TimeslotEntity} from "./src/entity/TimeslotEntity"
import {MongoTimeslotAdapter} from "./src/storage/adapter/mongo/MongoTimeslotAdapter";
import {DexieTimeslotAdapter} from "./src/storage/adapter/dexie/DexieTimeslotAdapter";
import {Repository as ResourceRepository} from "../resource/repository";
import {Repository as MonitorRepository} from "../monitor/repository";

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
        this.initInjectorDataTimeslotCotainerAggregate();
        this.initTimeslotSender();
        this.initTimeslotReceiver();
        this.initEntity();
        this.initHydrator();
        this.initDexieStorage();
    }

    /**
     * @returns Object
     */
    _getModuleConfig() {
        return  this.getContainer().get('ModuleConfig')['timeslot']['timeslot'];
    }

    /**
     * Merge config
     */
    initConfig() {
        this.getContainer().set(
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

        let store = new Store(
            this._getModuleConfig().storage.adapter.dexie['collection'],
            [
                "++id", 
                "name", 
                "status", 
                "duration", 
                "monitorContainerReference.id", 
                //"monitorContainerReference.parentId", 
                "resources.id",
                "*tags", 
                "rotation",
                "[monitorContainerReference.parentId+name]", 
            ]
        );

        dexieManager.addStore(store);

        dexieManager.on("ready", () => {

            const adapter = new DexieTimeslotAdapter(
                dexieManager, 
                this._getModuleConfig().storage.adapter.dexie['collection']
            );
            const storage = new Storage(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(
                this._getModuleConfig().hydrator['name-storage-service']
            ));

            storage.getEventManager()
                .on(Storage.BEFORE_SAVE, (data) => {
                    data.data.id = MongoIdGenerator.statcGenerateId();
                 });

            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig().storage['name-service'],
                storage
            );

            this.initTimeslotService();
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimeslotAdapter(
                this.getContainer().get(this._getModuleConfig().storage.adapter.mongo['connection-service']), 
                this._getModuleConfig().storage.adapter.mongo['collection']
            );
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(
                this._getModuleConfig().hydrator['name-storage-service']
            ));

            this.getContainer().get('StorageContainerAggregate').set( 
                this._getModuleConfig().storage['name-service'],
                storage
            );
            this.initTimeslotService();
        };

        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(MongoDb.READY_CONNECTION, loadStorage);
        }
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().entityService, 
                new TimeslotEntity()
            );
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service'],
                Repository.getTimeslotHydrator(this.getContainer())
            );
    }

    /**
     * @private
     */
    initTimeslotSender() {
        this.getContainer()
            .get('SenderContainerAggregate')
            .set(
                this._getModuleConfig().timeslotSender, 
                require('electron').ipcRenderer
            );
    }

    /**
     * @private
     */
    initTimeslotReceiver() {
        this.getContainer()
            .get('ReceiverContainerAggregate')
            .set(
                this._getModuleConfig().timeslotReceiver,
                require('electron').ipcRenderer
            );
    }

    /**
     *
     */
    initInjectorDataTimeslotCotainerAggregate() {

        const entityContainerAggregate = new ContainerAggregate();
        entityContainerAggregate.setPrototipeClass(AbstractInjector);
        entityContainerAggregate.setContainer(this.getContainer());

        entityContainerAggregate.set(
            'Test1',
            new Test1()
        );

        entityContainerAggregate.set(
            'Test2',
            new Test2()
        );

        this.getContainer().set(
            this._getModuleConfig().injectorDataTimeslotAggregate, 
            entityContainerAggregate
        );

    }

    /**
     *
     */
    initTimeslotService() {
        this.getContainer()
            .set(
                this._getModuleConfig().timeslotService,
                new TimeslotService(
                    this.getContainer().get('StorageContainerAggregate').get(this._getModuleConfig().storage['name-service']),
                    this.getContainer().get('SenderContainerAggregate').get(this._getModuleConfig().timeslotSender),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(this._getModuleConfig().injectorDataTimeslotAggregate)
                )
            );
    }

    /**
     * @param container
     */
    static getTimeslotHydrator(container) {

        let hydrator = new PropertyHydrator();
        
        hydrator.setTemplateObjectHydration(container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['timeslot']['timeslot'].entityService
            )
        );

        /**
         * Resource strategy
         */
        let resourceStrategy = new HydratorStrategy();
        resourceStrategy.setHydrator(ResourceRepository.getResourceHydrator(container));

        /**
         * Monitor strategy
         */
        let monitorStrategy = new HydratorStrategy();
        monitorStrategy.setHydrator(MonitorRepository.getMonitorContainerReferenceHydrator(container));

        /**
         * Timeslot bind strategy
         */
        let bindTimeslotStrategy = new HydratorStrategy();
        bindTimeslotStrategy.setHydrator(Repository.getTimeslotReferenceHydrator(container));

        /**
         * Timeslot bind strategy
         */
        let injectorDataStrategy = new HydratorStrategy();
        injectorDataStrategy.setHydrator(Repository.getInjectorHydrator(container));

        hydrator
            //.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            //.addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', 'id'));

        hydrator
            //.addValueStrategy('id', new MongoIdStrategy())
            //.addValueStrategy('_id', new MongoIdStrategy())
            .addValueStrategy('resources', resourceStrategy)
            .addValueStrategy('monitorContainerReference', monitorStrategy)
            .addValueStrategy('binds', bindTimeslotStrategy)
            .addValueStrategy('currentTime', new NumberStrategy())
            .addValueStrategy('duration', new NumberStrategy())
            .addValueStrategy('dataReferences', injectorDataStrategy)
            .addValueStrategy('enableAudio', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('currentTime')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('size')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('context')
            .enableHydrateProperty('monitorContainerReference')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('dataReferences')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('filters');

        hydrator.enableExtractProperty('id')
            .enableHydrateProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('binds')
            .enableExtractProperty('currentTime')
            .enableExtractProperty('duration')
            .enableExtractProperty('size')
            .enableExtractProperty('enableAudio')
            .enableExtractProperty('context')
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('resources')
            .enableExtractProperty('dataReferences')
            .enableExtractProperty('tags')
            .enableExtractProperty('rotation')
            .enableExtractProperty('filters');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
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

    /**
     * @param container
     * @return {*}
     */
    static getInjectorHydrator(container) {

        let hydrator = new PropertyHydrator();
        hydrator.setTemplateObjectHydration(new Injector());

        hydrator.enableHydrateProperty('name')
            .enableHydrateProperty('data');


        hydrator.enableExtractProperty('name')
            .enableExtractProperty('data');

        return hydrator;
    }

    /**
     *
     */
    initAcl() {
        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');
            // TODO add method on service
            aclService.addResource(this._getModuleConfig().acl.resource);
            aclService.allow('guest',  this._getModuleConfig().acl.resource);
        }
    }
}