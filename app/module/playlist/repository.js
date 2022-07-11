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
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {Repository as TimeslotRepository} from "./../timeslot/repository";
import {MongoPlaylistAdapter} from "./src/storage/adapter/mongo/MongoPlaylistAdapter";
import {DexiePlaylistAdapter} from "./src/storage/adapter/dexie/DexiePlaylistAdapter";
import {PlaylistService} from "./src/PlaylistService";
import {PlaylistEntity} from "./src/entity/PlaylistEntity";
import {TimeslotPlaylistReference} from "./src/entity/TimeslotPlaylistReference";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {
    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'playlist'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'PlaylistStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_ENTITY_SERVICE() { return 'PlaylistEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_TIMESLOT_REF_SERVICE() { return 'TimeslotPlaylistReference'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_ENTITY_SERVICE() { return 'PlaylistEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_HYDRATOR_SERVICE() { return 'PlaylistEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_HYDRATOR_SERVICE() { return 'PlaylistEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_SERVICE() { return 'PlaylistService'; };


    /**
     *
     */
    init() {
        this.loadConfig();
        this.initAcl();
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

        /**
         * Add schema
         */
        let store = new Store(Repository.COLLECTION, ["++id", "name", "status"]);
        dexieManager.addStore(store);

        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {

            const adapter = new DexiePlaylistAdapter(dexieManager, Repository.COLLECTION);
            const storage = new Storage(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.PLAYLIST_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
                storage
            );

            this.initPlaylistService();
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoPlaylistAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);

            const storage = new Storage(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.PLAYLIST_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
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
            .set(Repository.PLAYLIST_ENTITY_SERVICE, new PlaylistEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.PLAYLIST_TIMESLOT_REF_SERVICE, new TimeslotPlaylistReference());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.PLAYLIST_HYDRATOR_SERVICE,
                Repository.getPlaylistEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     *
     */
    initPlaylistService() {
        this.getContainer()
            .set(
                Repository.PLAYLIST_SERVICE,
                new PlaylistService(
                    this.getContainer().get('StorageContainerAggregate').get(TimeslotRepository.STORAGE_SERVICE),
                    this.getContainer().get('SenderContainerAggregate').get(TimeslotRepository.TIMESLOT_SENDER_SERVICE),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(TimeslotRepository.TIMESLOT_INJECTOR_DATA_SERVICE),
                    this.getContainer().get('StorageContainerAggregate').get(Repository.STORAGE_SERVICE)
                )
            );
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getPlaylistEntityHydrator(container) {
        let hydrator = new PropertyHydrator(
            container.get(Repository.PLAYLIST_ENTITY_SERVICE)
        );

        let timeslotStrategy = new HydratorStrategy();
        timeslotStrategy.setHydrator(Repository.getTimeslotReferenceHydrator(container));

        let playlistStrategy = new HydratorStrategy();
        playlistStrategy.setHydrator(Repository.getPlaylistReferenceHydrator(container));

        hydrator.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'));

        hydrator.addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy())
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
        monitorContainerStrategy.setHydrator(new PropertyHydrator(container.get('EntityNestedReference')));

        let hydrator = new PropertyHydrator(container.get(Repository.PLAYLIST_TIMESLOT_REF_SERVICE));
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
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.addResource('playlist');
            aclService.allow('guest', 'playlist');
        }
    }
}