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

import {IpcWrapper} from "@dsign/library/src/sender/IpcWrapper";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {AbstractInjector} from "./src/injector/AbstractInjector";
import {Test1} from "./src/injector/Test1";
import {Test2} from "./src/injector/Test2";
import {TimeslotEntity} from "./src/entity/TimeslotEntity"
import {MongoTimeslotAdapter} from "./src/storage/adapter/mongo/MongoTimeslotAdapter";
import {DexieTimeslotAdapter} from "./src/storage/adapter/dexie/DexieTimeslotAdapter";
import {Repository as ResourceRepository} from "./../resource/repository";
import {Repository as MonitorRepository} from "./../monitor/repository";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'timeslot'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'TimeslotStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_ENTITY_SERVICE() { return 'TimeslotEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_HYDRATOR_SERVICE() { return 'TimeslotEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_SERVICE() { return 'TimeslotService'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_INJECTOR_DATA_SERVICE() { return 'InjectorDataTimeslotAggregate'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_SENDER_SERVICE() { return 'TimeslotSender'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_RECEIVER_SERVICE() { return 'TimeslotReceiver'; };

    /**
     *
     */
    init() {
        this.loadConfig();
        this.initAcl();
        this.initInjectorDataTimeslotCotainerAggregate();
        this.initTimeslotSender();
        this.initTimeslotReceiver();
        this.initEntity();
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

        let store = new Store(
            Repository.COLLECTION,
            ["++id", "name", "status", "duration", "monitorContainerReference.id", "[monitorContainerReference.parentId+name]", "[resources.id]","*tags", "rotation"]

        );

        dexieManager.addStore(store);

        dexieManager.on("ready", () => {

            const adapter = new DexieTimeslotAdapter(dexieManager, Repository.COLLECTION);
            const storage = new Storage(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.TIMESLOT_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(Repository.STORAGE_SERVICE, storage);

            this.initTimeslotService();
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimeslotAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.TIMESLOT_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(Repository.STORAGE_SERVICE, storage);
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
            .set(Repository.TIMESLOT_ENTITY_SERVICE, new TimeslotEntity());
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.TIMESLOT_HYDRATOR_SERVICE,
                Repository.getTimeslotHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     * @private
     */
    initTimeslotSender() {
        this.getContainer()
            .get('SenderContainerAggregate')
            .set(Repository.TIMESLOT_SENDER_SERVICE, require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    initTimeslotReceiver() {
        this.getContainer()
            .get('ReceiverContainerAggregate')
            .set(Repository.TIMESLOT_RECEIVER_SERVICE, require('electron').ipcRenderer);
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

        this.getContainer().set(Repository.TIMESLOT_INJECTOR_DATA_SERVICE, entityContainerAggregate);

    }

    /**
     *
     */
    initTimeslotService() {
        this.getContainer()
            .set(
                Repository.TIMESLOT_SERVICE,
                new TimeslotService(
                    this.getContainer().get('StorageContainerAggregate').get(Repository.STORAGE_SERVICE),
                    this.getContainer().get('SenderContainerAggregate').get(Repository.TIMESLOT_SENDER_SERVICE),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(Repository.TIMESLOT_INJECTOR_DATA_SERVICE)
                )
            );
    }

    /**
     * @param container
     */
    static getTimeslotHydrator(container) {

        let hydrator = new PropertyHydrator();
        hydrator.setTemplateObjectHydration(container.get(Repository.TIMESLOT_ENTITY_SERVICE));

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

        hydrator.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'));

        hydrator.addValueStrategy('resources', resourceStrategy)
            .addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy())
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
        hydrator.setTemplateObjectHydration(container.get('EntityReference'));

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
            aclService.addResource('timeslot');
            aclService.allow('guest', 'timeslot');
        }
    }
}