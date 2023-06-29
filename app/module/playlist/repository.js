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
import {MapPropertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy";
import {MongoPlaylistAdapter} from "./src/storage/adapter/mongo/MongoPlaylistAdapter";
import {DexiePlaylistAdapter} from "./src/storage/adapter/dexie/DexiePlaylistAdapter";
import {PlaylistService} from "./src/PlaylistService";
import {PlaylistEntity} from "./src/entity/PlaylistEntity";
import {TimeslotPlaylistReference} from "./src/entity/TimeslotPlaylistReference";
//import {Test1} from "./src/injector/Test1";
//import {Test2} from "./src/injector/Test2";
//import {MongoTimeslotAdapter} from "./src/storage/adapter/mongo/MongoTimeslotAdapter";
//import {DexieTimeslotAdapter} from "./src/storage/adapter/dexie/DexieTimeslotAdapter";
//import {Repository as ResourceRepository} from "./../resource/repository";
//import {Repository as MonitorRepository} from "./../monitor/repository";

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
        this.initHydrator();
        this.initDexieStorage();
    }

    /**
     * @returns Object
     */
    _getModuleConfig() {
        return  this.getContainer().get('ModuleConfig')['playlist']['playlist'];
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

        /**
         * Add schema
         */
        let store = new Store(
            this._getModuleConfig().storage.adapter.dexie['collection'],
            ["++id", "name", "status"]
        );
        dexieManager.addStore(store);

        /**
         * Create Schema
         */
        var generateSchema = () => {

            let hydrator = this.getContainer().get('HydratorContainerAggregate').get(
                this._getModuleConfig().hydrator['name-storage-service']
            );
            hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

            const adapter = new DexiePlaylistAdapter(
                dexieManager, 
                this._getModuleConfig().storage.adapter.dexie['collection']
            );
            
            const storage = new Storage(adapter);
            storage.setHydrator(hydrator);
            storage.getEventManager()
                .on(Storage.BEFORE_SAVE, (data) => {
                    data.data.id = MongoIdGenerator.statcGenerateId();
                });


            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig().storage['name-service'],
                storage
            );

            this.initPlaylistService();
        }

        if(dexieManager.isOpen()) {
            let version = dexieManager.upgradeSchema();
            this.getContainer().get('Config').storage.adapter.dexie.version = version._cfg.version;
            this.getContainer().get('StorageContainerAggregate')
                .get('ConfigStorage')
                .update(this.getContainer().get('Config'))
                .then((data) => {
                    this.getContainer().get('SenderContainerAggregate')
                        .get('Ipc')
                        .send('proxy', {event:'relaunch', data: {}}
                    );
                });
        } else {
            dexieManager.on("ready", (data) => {
                generateSchema();
            });
        }
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoPlaylistAdapter(
                this.getContainer().get('MongoDb'), 
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

            this.initPlaylistService();
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
                this._getModuleConfig().entityService, 
                new PlaylistEntity()
        );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().entityServiceTimeslotRef, 
                new TimeslotPlaylistReference()
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
                Repository.getPlaylistEntityHydrator(this.getContainer())
            );
    }

    /**
     *
     */
    initPlaylistService() {
        this.getContainer()
            .set(
                this._getModuleConfig().playlistService,
                new PlaylistService(
                    this.getContainer().get('StorageContainerAggregate').get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].storage['name-service']),
                    this.getContainer().get('SenderContainerAggregate').get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].timeslotSender),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].injectorDataTimeslotAggregate),
                    this.getContainer().get('StorageContainerAggregate').get(this._getModuleConfig().storage['name-service'])
                )
            );
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getPlaylistEntityHydrator(container) {
        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['playlist']['playlist'].entityService
            )
        );

        let timeslotStrategy = new HydratorStrategy();
        timeslotStrategy.setHydrator(Repository.getTimeslotReferenceHydrator(container));

        let playlistStrategy = new HydratorStrategy();
        playlistStrategy.setHydrator(Repository.getPlaylistReferenceHydrator(container));

        hydrator
            .addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

        hydrator
            .addValueStrategy('timeslots', timeslotStrategy)
            .addValueStrategy('binds', playlistStrategy)
            .addValueStrategy('enableAudio', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE));

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('context')
            .enableExtractProperty('rotation')
            .enableExtractProperty('enableAudio')
            .enableExtractProperty('currentIndex')
            .enableExtractProperty('binds')
            .enableExtractProperty('timeslots');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('context')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('currentIndex')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('timeslots');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getTimeslotReferenceHydrator(container) {

        let monitorContainerStrategy = new HydratorStrategy();
        monitorContainerStrategy.setHydrator(new PropertyHydrator(
            container.get('EntityContainerAggregate').get('EntityNestedReference')
        ));

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['playlist']['playlist'].entityServiceTimeslotRef
            )
        );
        hydrator.addValueStrategy('monitorContainerReference', monitorContainerStrategy)
            .addValueStrategy('duration', new NumberStrategy())
            .addValueStrategy('currentTime', new NumberStrategy());

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('parentId')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('monitorContainerReference')
            .enableHydrateProperty('name')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('currentTime');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('parentId')
            .enableExtractProperty('collection')
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('name')
            .enableExtractProperty('duration')
            .enableExtractProperty('currentTime');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getPlaylistReferenceHydrator(container) {

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
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.addResource(this._getModuleConfig().acl.resource);
            aclService.allow('guest', this._getModuleConfig().acl.resource);
        }
    }
}