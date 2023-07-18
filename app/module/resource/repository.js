import { config } from './config';
import { ContainerAware } from "@dsign/library/src/container/ContainerAware.js";
import { Store } from "@dsign/library/src/storage/adapter/dexie/Store";
import { Storage } from "@dsign/library/src/storage/Storage";
import { MongoDb } from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import { EventManager } from '@dsign/library/src/event/EventManager';
import { EventManagerAggregate } from '@dsign/library/src/event/EventManagerAggregate';
import { AggregatePropertyHydrator, PropertyHydrator } from "@dsign/library/src/hydrator/index";
import { HydratorStrategy, MongoIdStrategy } from "@dsign/library/src/hydrator/strategy/value/index";
import { MapProprertyStrategy } from "@dsign/library/src/hydrator/strategy/proprerty/index";
import { MongoIdGenerator } from "@dsign/library/src/storage/util/MongoIdGenerator";
import { ProxyEventManager } from '@dsign/library/src/event/electron/ProxyEventManager';
import { PathNode } from "@dsign/library/src/path/index";
import { ResourceService } from "./src/ResourceService";
import { FileEntity } from "./src/entity/FileEntity";
import { AudioEntity } from "./src/entity/AudioEntity";
import { VideoEntity } from "./src/entity/VideoEntity";
import { ImageEntity } from "./src/entity/ImageEntity";
import { MetadataEntity } from "./src/entity/MetadataEntity";
import { MultiMediaEntity } from "./src/entity/MultiMediaEntity";
import { ResourceSenderEntity } from "./src/entity/ResourceSenderEntity";
import { MongoResourceAdapter } from "./src/storage/adapter/mongo/MongoResourceAdapter";
import { DexieResourceAdapter } from "./src/storage/adapter/dexie/DexieResourceAdapter";
import { ResourceSenderService } from "./src/ResourceSenderService";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

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
        this.initConfig();
        this.initAcl();
        this.initEntity();
        this.initIpcService();
        this.initHydrator();
        this.initDexieStorage();
        this.initResourceMonitorDexieStorage();
        this.initService();
    }

    /**
     * @returns Object
     */
    _getModuleConfig() {
        return this.getContainer().get('ModuleConfig')['resource']['resource'];
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
    initService() {

        this.getContainer().set(
            this._getModuleConfig().resourceService,
            new ResourceService(this.getContainer().get('Application').getResourcePath())
        );
    }

    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().entityService,
                new FileEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().entityServiceVideo,
                new VideoEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().entityServiceAudio,
                new AudioEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().entityServiceImage,
                new ImageEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().metadataEntity,
                new MetadataEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().multiMediaEntity,
                new MultiMediaEntity()
            );

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this._getModuleConfig().resourceSenderEntity,
                new ResourceSenderEntity()
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
                "type",
                "size",
                "name",
                "*tags",
                "dimension.height",
                "dimension.width"
            ]
        );
        dexieManager.addStore(store);

        dexieManager.on("ready", () => {

            const adapter = new DexieResourceAdapter(
                dexieManager,
                this._getModuleConfig().storage.adapter.dexie['collection']
            );
            const storage = new Storage(adapter);
            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['name-storage-service-resource']
                )
            );

            storage.getEventManager()
                .on(Storage.BEFORE_UPDATE, this.onBeforeUpdate.bind(this))
                .on(Storage.POST_UPDATE, this.onPostUpsert.bind(this))
                .on(Storage.BEFORE_SAVE, this.onBeforeSave.bind(this))
                .on(Storage.POST_SAVE, this.onPostUpsert.bind(this))
                .on(Storage.POST_REMOVE, this.onPostRemove.bind(this));

            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig().storage['name-service'],
                storage
            );

            let resourceSenderService = new ResourceSenderService(
                storage,
                this.getContainer().get('Timer'),
                this.getContainer().get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].injectorDataTimeslotAggregate),
            )

            resourceSenderService.setEventManager(
                this.getEventManagerAggregate()
            )

            this.getContainer().set( this._getModuleConfig().resourceSenderService, resourceSenderService);
        });
    }

    /**
     *
     */
    initResourceMonitorDexieStorage() {

        const dexieManager = this.getContainer().get(
            this._getModuleConfig()['storage-resource-monitor'].adapter.dexie['connection-service']
        );

        let store = new Store(
            this._getModuleConfig()['storage-resource-monitor'].adapter.dexie['collection'],
            [
                "++id",
                "name",
                "*tags"
            ]
        );

        dexieManager.addStore(store);

        dexieManager.on("ready", () => {

            const adapter = new DexieResourceAdapter(
                dexieManager,
                this._getModuleConfig()['storage-resource-monitor'].adapter.dexie['collection']
            );
            const storage = new Storage(adapter);

            storage.getEventManager()
                .on(Storage.BEFORE_SAVE, (data) => {
                    data.data.id = MongoIdGenerator.statcGenerateId();
                });

            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['resource-monitor-storage-service']
                )
            );

            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig()['storage-resource-monitor']['name-service'],
                storage
            );
        });
    }


    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoResourceAdapter(
                this.getContainer().get(this._getModuleConfig().storage.adapter.mongo['connection-service']),
                this._getModuleConfig().storage.adapter.mongo['collection']
            );
            const storage = new Storage(adapter);

            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['name-storage-service-resource']
                )
            );

            storage.getEventManager()
                .on(Storage.BEFORE_UPDATE, this.onBeforeUpdate.bind(this))
                .on(Storage.POST_UPDATE, this.onPostUpsert.bind(this))
                .on(Storage.BEFORE_SAVE, this.onBeforeSave.bind(this))
                .on(Storage.POST_SAVE, this.onPostUpsert.bind(this))
                .on(Storage.POST_REMOVE, this.onPostRemove.bind(this));

            this.getContainer().get('StorageContainerAggregate').set(
                this._getModuleConfig().storage['name-service'],
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

    initIpcService() {
        this.getContainer().set(
            this._getModuleConfig().ipcSender,
            require('electron').ipcRenderer
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

    onPostUpsert(evt) {

        this._checkUpdateMetadata(evt.data);
        if (evt.data.resourceToImport) {
            delete evt.data.resourceToImport;
        }
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
                this.fs.mkdirSync(fileDirectory, { recursive: true });
            }

            let fileName = `${fileDirectory}${this.path.sep}${resourceEntity.id}.${resourceEntity.resourceToImport.path.split('.').pop()}`;
            this.fs.copyFileSync(resourceEntity.resourceToImport.path, fileName);

            resourceEntity.path = new PathNode();
            resourceEntity.path.nameFile = resourceEntity.id;
            resourceEntity.path.extension = resourceEntity.resourceToImport.path.split('.').pop();
            resourceEntity.checksum = this._computeChecksum(fileName);

            switch (resourceEntity.type) {
                case 'application/zip':
                    this._extractZip(resourceEntity);
                    break;
            }
        }
    }

    /**
     * @param {string} fileName 
     * @returns 
     */
    _computeChecksum(fileName) {
        let fileBuffer = this.fs.readFileSync(fileName);
        const crypto = require('crypto');
        let hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);

        return hashSum.digest('hex');
    }

    /**
     * 
     * @param {*} resourceEntity 
     * @returns 
     */
    _checkUpdateMetadata(resourceEntity) {
        switch (resourceEntity.type) {
            case 'video/mp4':
            case 'video/webm':
            case 'image/jpeg':
            case 'image/png':
                this._updateMetadata(resourceEntity);
                break;
        }
    }

    /**
     * @param resourceEntity
     * @private
     */
    _updateMetadata(resourceEntity) {
        if (resourceEntity.resourceToImport && resourceEntity.resourceToImport.path) {
            let command = this.fluentFfmeg(resourceEntity.resourceToImport.path);
            command.ffprobe(0, function (err, metadata) {
                if (err) {
                    console.error(err);
                    return;
                }

                let storage = this.getContainer().get('StorageContainerAggregate').get(
                    this._getModuleConfig().storage['name-service'],
                );
                let entity = storage.getHydrator().hydrate(resourceEntity);

                entity.dimension = {
                    height: metadata.streams[0].height,
                    width: metadata.streams[0].width
                };

                if (entity.type.match('video.*')) {

                    entity.fps = metadata.streams[0]['r_frame_rate'];
                    entity.duration = metadata.format.duration;
                    entity.aspectRation = metadata.streams[0]['sample_aspect_ratio'];
                }

                storage.update(entity);

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

        let packageJson = `${this.getContainer().get('ResourceService').getResourceDirectory(resourceEntity)}${this.path.sep}package.json`;
        if (this.fs.existsSync(packageJson)) {
            let wcConfig = JSON.parse(this.fs.readFileSync(packageJson).toString());

            if (wcConfig.main === undefined) {
                console.warn('Main property not set in package json');
                return;
            }

            resourceEntity.path.nameFile = wcConfig.main.split('.').shift();
            resourceEntity.path.extension = wcConfig.main.split('.').pop();
            resourceEntity.type = 'application/javascript';
            resourceEntity.wcName = wcConfig.name;
            console.log('RESOURCE', resourceEntity)

        } else {
            console.warn(`${packageJson} not found in archive`);
        }
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service'],
                Repository.getFileEntityHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service-audio'],
                Repository.getAudioEntityHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service-video'],
                Repository.getVideoEntityHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service-image'],
                Repository.getImageEntityHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['name-storage-service-resource'],
                Repository.getResourceHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['resource-monitor-service'],
                Repository.getResourceSenderEntityMonitorHydrator(this.getContainer())
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this._getModuleConfig().hydrator['resource-monitor-storage-service'],
                Repository.getResourceSenderEntityStorageHydrator(this.getContainer())
            );

    }

    static getResourceSenderEntityStorageHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].resourceSenderEntity
            )
        );

        hydrator
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', 'id'));

        hydrator.enableHydrateProperty('_id')
            .enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('monitorContainerReference')
            .enableHydrateProperty('resourceReference');

        hydrator.enableExtractProperty('_id')
            .enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('resourceReference');

        let resourceHydrator = Repository.getResourceHydrator(container);
        
        let disableProperties = {
            'dimension': true,
            'checksum': true,
            'path': true,
            'size': true,
            'type': true,
            'tags': true,
            'duration': true,
            'aspectRation': true,
            'fps': true
        };
         
        let enableProperties = {
            'filters': true,
            'currentTime': true,
            'status': true,
            'rotation': true,
            'adjust': true,
            'context': true
        }

       
        Object.keys(resourceHydrator.hydratorMap).forEach(function(key) {

            Object.keys(disableProperties).forEach(function(keyDisable) {  
                resourceHydrator.hydratorMap[key].hydrator.disableExtractProperty(keyDisable);
                resourceHydrator.hydratorMap[key].hydrator.disableHydrateProperty(keyDisable);
                
            });
            Object.keys(enableProperties).forEach(function(keyEnable) {  
                resourceHydrator.hydratorMap[key].hydrator.enableHydrateProperty(keyEnable);
                resourceHydrator.hydratorMap[key].hydrator.enableExtractProperty(keyEnable);
            });
    
        });

        let resourceStrategyHydrator = new HydratorStrategy();
        resourceStrategyHydrator.setHydrator(resourceHydrator);

        let monitorStrategyHydrator = new HydratorStrategy();
        monitorStrategyHydrator.setHydrator(this.getMonitorContainerReferenceHydrator(container));

        hydrator.addValueStrategy('resourceReference', resourceStrategyHydrator);
        hydrator.addValueStrategy('monitorContainerReference', monitorStrategyHydrator);

        return hydrator;
    }

    static getResourceSenderEntityMonitorHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].resourceSenderEntity
            )
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('monitorContainerReference')
            .enableHydrateProperty('resourceReference');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')   
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('resourceReference');

        let resourceStrategyHydrator = new HydratorStrategy();
        resourceStrategyHydrator.setHydrator(Repository.getResourceHydrator(container));

        hydrator.addValueStrategy('resourceReference', resourceStrategyHydrator);

        return hydrator;
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
            ['application/zip', 'application/javascript']
        ).addHydratorMap(
            Repository.getAudioEntityHydrator(container),
            ['audio/mp3', 'audio/ogg']
        ).addHydratorMap(
            Repository.getMultiMediaHydrator(container),
            ['multi/media']
        ).addHydratorMap(
            Repository.getFileEntityHydrator(container),
            ['text/html']
        );

        return hydrator;
    }

    /**
     * @param container
     */
    static getFileEntityHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].entityService
            )
        );

        let pathHydratorStrategy = new HydratorStrategy();
        pathHydratorStrategy.setHydrator(Repository.getPathHydrator(container));

        hydrator.addValueStrategy('path', pathHydratorStrategy)

        hydrator
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', 'id'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('path')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('checksum')
            .enableHydrateProperty('filters');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('path')
            .enableExtractProperty('tags')
            .enableExtractProperty('checksum')
            .enableExtractProperty('filters');

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getVideoEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].entityServiceVideo
            )
        );

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
        hydrator.setTemplateObjectHydration(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].entityServiceImage
            )
        );

        hydrator.enableHydrateProperty('dimension');

        hydrator.enableExtractProperty('dimension');

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getAudioEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].entityServiceAudio
            )
        );

        hydrator.enableHydrateProperty('duration');

        hydrator.enableExtractProperty('duration');

        return hydrator;
    }

    static getMultiMediaHydrator(container) {
        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].multiMediaEntity
            )
        );

        hydrator.addPropertyStrategy('_id', new MapProprertyStrategy('id', 'id'));

        /**
         * Resource strategy
         */
        let resourceStrategy = new HydratorStrategy();
        resourceStrategy.setHydrator(Repository.getResourceReferenceHydrator(container));


        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('type')
            .enableHydrateProperty('tags')

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('resources')
            .enableExtractProperty('type')
            .enableExtractProperty('tags');

        hydrator.addValueStrategy('resources', resourceStrategy);

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getWebComponentEntityHydrator(container) {

        let hydrator = Repository.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['resource']['resource'].metadataEntity
            )
        );

        hydrator.enableHydrateProperty('wcName')
            .enableHydrateProperty('dataReferences');

        hydrator.enableExtractProperty('wcName')
            .enableExtractProperty('dataReferences');

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

            aclService.addResource(this._getModuleConfig().acl.resource);
            aclService.allow('guest', this._getModuleConfig().acl.resource);
        }
    }
}