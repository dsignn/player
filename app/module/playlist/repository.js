import { config } from './config';
import { ContainerAggregate, ContainerAware } from "@dsign/library/src/container/index";
import { Store } from "@dsign/library/src/storage/adapter/dexie/Store";
import { Storage } from "@dsign/library/src/storage/Storage";
import { MongoDb } from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import { EventManager } from '@dsign/library/src/event/EventManager';
import { EventManagerAggregate } from '@dsign/library/src/event/EventManagerAggregate';
import { ProxyEventManager } from '@dsign/library/src/event/electron/ProxyEventManager';
import { PropertyHydrator } from "@dsign/library/src/hydrator/index";
import {
    HybridStrategy,
    HydratorStrategy,
    MongoIdStrategy,
    NumberStrategy
} from "@dsign/library/src/hydrator/strategy/value/index";
import { MapPropertyStrategy } from "@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy";
import { MongoPlaylistAdapter } from "./src/storage/adapter/mongo/MongoPlaylistAdapter";
import { MongoIdGenerator } from "@dsign/library/src/storage/util/MongoIdGenerator";
import { DexiePlaylistAdapter } from "./src/storage/adapter/dexie/DexiePlaylistAdapter";
import { PlaylistService } from "./src/PlaylistService";
import { PlaylistEntity } from "./src/entity/PlaylistEntity";
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
        return this.getContainer().get('ModuleConfig')['playlist']['playlist'];
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

        if (dexieManager.isOpen()) {
            let version = dexieManager.upgradeSchema();
            this.getContainer().get('Config').storage.adapter.dexie.version = version._cfg.version;
            this.getContainer().get('StorageContainerAggregate')
                .get('ConfigStorage')
                .update(this.getContainer().get('Config'))
                .then((data) => {
                    this.getContainer().get('SenderContainerAggregate')
                        .get('Ipc')
                        .send('proxy', { event: 'relaunch', data: {} }
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
     * Event manager for sender resource
     */
    getEventManagerAggregate() {

        let eventManagerAggregate = new EventManagerAggregate();

        /**
           * Local event manager
           */
        let eventManager = new EventManager();

        /**
         * ipc event mangager
         */
        let proxyEventManager = new ProxyEventManager(
            this.getContainer().get(
                this._getModuleConfig().ipcSender
            ));


        eventManagerAggregate
            .addEventManager(proxyEventManager)
            .addEventManager(eventManager);

        return eventManagerAggregate;
    }

    /**
     *
     */
    initPlaylistService() {

        let playlistService = new PlaylistService(
            this.getContainer().get('StorageContainerAggregate').get('ResourceStorage'),
            this.getContainer().get('Timer'),
            this.getContainer().get('resourceDataContainerAggregate'),
            this.getContainer().get('StorageContainerAggregate').get(this._getModuleConfig().storage['name-service'])
        );

        playlistService.setEventManager(
            this.getEventManagerAggregate()
        )


        playlistService.getEventManager().on(
            PlaylistService.PLAY,
            playlistService._updateResourceSender.bind(playlistService)
        );

        playlistService.getEventManager().on(
            PlaylistService.RESUME,
            playlistService._updateResourceSender.bind(playlistService)
        );

        playlistService.getEventManager().on(
            PlaylistService.PAUSE,
            playlistService._updateResourceSender.bind(playlistService)
        );

        playlistService.getEventManager().on(
            PlaylistService.STOP,
            playlistService._updateResourceSender.bind(playlistService)
        );

        playlistService.getEventManager().on(
            PlaylistService.CHANGE_TIME,
            playlistService._updateResourceSender.bind(playlistService)
        );


        this.getContainer()
            .set(
                this._getModuleConfig().playlistService,
                playlistService
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

        let monitorStrategy = new HydratorStrategy();
        monitorStrategy.setHydrator(Repository.getMonitorReferenceHydrator(container));

        let resourceStrategy = new HydratorStrategy();
        resourceStrategy.setHydrator(Repository.getResourceReferenceHydrator(container));

        let playlistStrategy = new HydratorStrategy();
        playlistStrategy.setHydrator(Repository.getPlaylistReferenceHydrator(container));

        hydrator
            .addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

        hydrator.addValueStrategy('resources', resourceStrategy)
            .addValueStrategy('monitorContainerReference', monitorStrategy)
            .addValueStrategy('binds', playlistStrategy)
            .addValueStrategy('enableAudio', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE));

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('context')
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('rotation')
            .enableExtractProperty('enableAudio')
            .enableExtractProperty('currentIndex')
            .enableExtractProperty('binds')
            .enableExtractProperty('resources');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('context')
            .enableHydrateProperty('monitorContainerReference')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('currentIndex')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('resources');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getResourceReferenceHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('EntityContainerAggregate').get('EntityReference')
            )
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('currentTime');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('currentTime');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getMonitorReferenceHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('EntityContainerAggregate').get('EntityNestedReference')
            )
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