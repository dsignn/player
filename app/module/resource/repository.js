import {config} from './config';
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {Store} from "@dsign/library/src/storage/adapter/dexie/Store";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {AggregatePropertyHydrator, PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {HydratorStrategy, MongoIdStrategy} from "@dsign/library/src/hydrator/strategy/value/index";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {MongoIdGenerator} from "@dsign/library/src/storage/util/MongoIdGenerator";
import {PathNode} from "@dsign/library/src/path/index";
import {ResourceService} from "./src/ResourceService";
import {FileEntity} from "./src/entity/FileEntity";
import {AudioEntity} from "./src/entity/AudioEntity";
import {VideoEntity} from "./src/entity/VideoEntity";
import {ImageEntity} from "./src/entity/ImageEntity";
import {MongoResourceAdapter} from "./src/storage/adapter/mongo/MongoResourceAdapter";
import {DexieResourceAdapter} from "./src/storage/adapter/dexie/DexieResourceAdapter";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'resource'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'ResourceStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get FILE_ENTITY_SERVICE() { return 'FileEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get IMAGE_ENTITY_SERVICE() { return 'ImageEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEO_ENTITY_SERVICE() { return 'VideoEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get AUDIO_ENTITY_SERVICE() { return 'AudioEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get FILE_HYDRATOR_SERVICE() { return 'FileEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get IMAGE_HYDRATOR_SERVICE() { return 'ImageEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEO_HYDRATOR_SERVICE() { return 'VideoEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get AUDIO_HYDRATOR_SERVICE() { return 'AudioEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get RESOURCE_HYDRATOR_SERVICE() { return 'ResourceEntityHydrator'; };

    /**
     *
     */
    constructor() {
        super();

        /**
         * @type {module:fs}
         */
        this.fs = require('fs');

        /**
         * @type {module:path}
         */
        this.path = require('path');

        /**
         *
         */
        this.fluentFfmeg = require('fluent-ffmpeg');

        /**
         *
         */
        this.zip = require('adm-zip');
    }

    /**
     *
     */
    init() {
        this.loadConfig();
        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initMongoStorage();
        this.initService();
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
    initService() {
        // TODO inject path
        let service = new ResourceService(this.getContainer().get('Application').getResourcePath());
        this.getContainer().set(
            service.constructor.name,
            service
        );
    }

    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.FILE_ENTITY_SERVICE, new FileEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.VIDEO_ENTITY_SERVICE, new VideoEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.AUDIO_ENTITY_SERVICE, new AudioEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.IMAGE_ENTITY_SERVICE, new ImageEntity());

    }

    /**
     *
     */
    initDexieStorage() {

        const dexieManager = this.getContainer().get('DexieManager');

        let store = new Store(Repository.COLLECTION, [ "++id", "type", "size", "name", "*tags"]);
        dexieManager.addStore(store);

        dexieManager.on("ready", () => {

            const adapter = new DexieResourceAdapter(dexieManager, Repository.COLLECTION);
            const storage = new Storage(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.RESOURCE_HYDRATOR_SERVICE));

            storage.getEventManager()
                .on(Storage.BEFORE_UPDATE, this.onBeforeUpdate.bind(this))
                .on(Storage.BEFORE_SAVE, this.onBeforeSave.bind(this))
                .on(Storage.POST_REMOVE, this.onPostRemove.bind(this));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
                storage
            );
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoResourceAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.RESOURCE_HYDRATOR_SERVICE));

            storage.getEventManager()
                .on(Storage.BEFORE_UPDATE, this.onBeforeUpdate.bind(this))
                .on(Storage.BEFORE_SAVE, this.onBeforeSave.bind(this))
                .on(Storage.POST_REMOVE, this.onPostRemove.bind(this));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
                storage
            );
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
     * @param evt
     */
    onBeforeSave(evt) {
        evt.data.id = MongoIdGenerator.statcGenerateId();
        this._checkFileResource(evt.data);
    }

    /**
     * @param evt
     */
    onBeforeUpdate(evt) {
        if (evt.data.resourceToImport) {
            this._clearDirectory(evt.data);
        }
        this._checkFileResource(evt.data);
    }


    /**
     * @param evt
     */
    onPostRemove(evt) {
        this._clearDirectory(evt.data);
    }

    /**
     * @param resourceEntity
     * @private
     */
    _clearDirectory(resourceEntity) {

        let dirToClear = `${this.getContainer().get('Application').getResourcePath()}${this.path.sep}${resourceEntity.id}`;
        const fse = require("fs-extra");
        fse.removeSync(dirToClear);
    }

    /**
     * @param resourceEntity
     * @private
     */
    _checkFileResource(resourceEntity) {

        if (resourceEntity.resourceToImport) {

            let fileDirectory = `${this.getContainer().get('Application').getResourcePath()}${this.path.sep}${resourceEntity.id}`;
            if (!this.fs.existsSync(fileDirectory)) {
                this.fs.mkdirSync(fileDirectory);
            }

            let fileName = `${fileDirectory}${this.path.sep}${resourceEntity.id}.${resourceEntity.resourceToImport.path.split('.').pop()}`;
            this.fs.copyFileSync(resourceEntity.resourceToImport.path, fileName);

            resourceEntity.path = new PathNode();
            resourceEntity.path.nameFile = resourceEntity.id;
            resourceEntity.path.extension = resourceEntity.resourceToImport.path.split('.').pop();

            switch (resourceEntity.type) {
                case 'video/mp4':
                case 'video/webm':
                case 'image/jpeg':
                case 'image/png':
                    this._updateMetadata(resourceEntity);
                    break;
                case 'application/zip':
                    this._extractZip(resourceEntity);
                    break;
            }
        }
    }

    /**
     * @param resourceEntity
     * @private
     */
    _updateMetadata(resourceEntity) {
        if (resourceEntity.resourceToImport.path) {
            let command = this.fluentFfmeg(resourceEntity.resourceToImport.path);
            command.ffprobe(0, function(err, metadata) {
                    if (err) {
                        console.error(err);
                        return;
                    }

                    let storage = this.getContainer().get('StorageContainerAggregate').get(Repository.STORAGE_SERVICE);
                    let entity = storage.getHydrator().hydrate(resourceEntity);

                    entity.dimension = {
                        height: metadata.streams[0].height,
                        width: metadata.streams[0].width
                    };

                    if(entity.type.match('video.*')) {

                        entity.fps = metadata.streams[0]['r_frame_rate'];
                        entity.duration = metadata.format.duration;
                        entity.aspectRation = metadata.streams[0]['sample_aspect_ratio'];
                    }

                    // TODO better solution
                    setTimeout(
                        () => {
                            storage.update(entity);
                        },
                        3000
                    );

                }.bind(this)
            );
        }
    }

    /**
     * @param resourceEntity
     * @private
     */
    _extractZip(resourceEntity) {

        let zip = new this.zip(this.getContainer().get('ResourceService').getResourcePath(resourceEntity));
        zip.extractAllTo(this.getContainer().get('ResourceService').getResourceDirectory(resourceEntity), true);

        let packageJson = `${this.getContainer().get('ResourceService').getResourceDirectory(resourceEntity)}package.json`;
        if (this.fs.existsSync(packageJson)) {
            let wcConfig = JSON.parse(this.fs.readFileSync(packageJson).toString());

            if (wcConfig.main === undefined) {
                console.warn('Main property not set in package json');
                return;
            }

            resourceEntity.path.nameFile = wcConfig.main.split('.').shift() ;
            resourceEntity.path.extension = wcConfig.main.split('.').pop();
            resourceEntity.type = 'application/javascript';
            resourceEntity.wcName = wcConfig.name;

        } else {
            console.warn('Package.json not found in archive');
        }
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.FILE_HYDRATOR_SERVICE,
                Repository.getFileEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.AUDIO_HYDRATOR_SERVICE,
                Repository.getAudioEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.VIDEO_HYDRATOR_SERVICE,
                Repository.getVideoEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.IMAGE_HYDRATOR_SERVICE,
                Repository.getImageEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.RESOURCE_HYDRATOR_SERVICE,
                Repository.getResourceHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     * @param container
     */
    static getResourceHydrator(container) {

        let hydrator = new AggregatePropertyHydrator(['type']);

        hydrator.addHydratorMap(
            Repository.getImageEntityHydrator(container),
            ['image/jpeg', 'image/png']
        ).addHydratorMap(
            Repository.getVideoEntityHydrator(container),
            ['video/mp4', 'video/webm']
        ).addHydratorMap(
            Repository.getWebComponentEntityHydrator(container),
            ['application/zip', 'text/html', 'application/javascript']
        ).addHydratorMap(
            Repository.getAudioEntityHydrator(container),
            ['audio/mp3']
        );

        return hydrator;
    }

    /**
     * @param container
     */
    static getFileEntityHydrator(container) {

        let hydrator = new PropertyHydrator(container.get(Repository.FILE_ENTITY_SERVICE));

        let pathHydratorStrategy = new HydratorStrategy();
        pathHydratorStrategy.setHydrator(Repository.getPathHydrator(container));

        hydrator.addValueStrategy('path', pathHydratorStrategy)
            .addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy());

        hydrator.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('path')
            .enableHydrateProperty('tags');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('path')
            .enableExtractProperty('tags');

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getVideoEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(Repository.VIDEO_ENTITY_SERVICE));

        hydrator.enableHydrateProperty('fps')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('dimension')
            .enableHydrateProperty('aspectRation');

        hydrator.enableExtractProperty('fps')
            .enableExtractProperty('duration')
            .enableExtractProperty('dimension')
            .enableExtractProperty('aspectRation');

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getImageEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(Repository.IMAGE_ENTITY_SERVICE));

        hydrator.enableHydrateProperty('dimension');

        hydrator.enableExtractProperty('dimension');

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getWebComponentEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);

        hydrator.enableHydrateProperty('wcName');

        hydrator.enableExtractProperty('wcName');

        return hydrator;
    }


    /**
     * @param container
     * @return AbstractHydrator
     */
    static getAudioEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(Repository.AUDIO_ENTITY_SERVICE));

        hydrator.enableHydrateProperty('duration');

        hydrator.enableExtractProperty('duration');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getPathHydrator(container) {

        let hydrator = new PropertyHydrator(new PathNode());

        hydrator.enableHydrateProperty('directory')
            .enableHydrateProperty('nameFile')
            .enableHydrateProperty('extension');

        hydrator.enableExtractProperty('directory')
            .enableExtractProperty('nameFile')
            .enableExtractProperty('extension');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getResourceReferenceHydrator(container) {

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
            aclService.addResource('resource');
            aclService.allow('guest', 'resource');
        }
    }
}