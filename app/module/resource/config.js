/**
 *
 */
class ResourceConfig extends require("@dsign/library").container.ContainerAware {

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

        this.initEntity();
        this.initHydrator();
        this.initStorage();
        this.initService();
    }

    /**
     *
     */
    initService() {

        let service = new ResourceService(this.getContainer().get('Application').getResourcePath());
        this.getContainer().set(
            service.constructor.name,
            service
        );
    }

    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(ResourceConfig.FILE_ENTITY_SERVICE, new FileEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(ResourceConfig.VIDEO_ENTITY_SERVICE, new VideoEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(ResourceConfig.AUDIO_ENTITY_SERVICE, new AudioEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(ResourceConfig.IMAGE_ENTITY_SERVICE, new ImageEntity());

    }

    /**
     *
     */
    initStorage() {

        const dexieManager = this.getContainer().get('DexieManager');


        let store = new (require("@dsign/library").storage.adapter.dexie.Store)(
            ResourceConfig.COLLECTION,
            [ "++id", "type", "size", "name", "*tags"]

        );

        dexieManager.addStore(store);



        dexieManager.on("ready", () => {

            const adapter = new DexieResourceAdapter(dexieManager, ResourceConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(ResourceConfig.RESOURCE_HYDRATOR_SERVICE));

            storage.getEventManager().on(
                require("@dsign/library").storage.Storage.BEFORE_UPDATE,
                this.onBeforeUpdate.bind(this)
            );

            storage.getEventManager().on(
                require("@dsign/library").storage.Storage.BEFORE_SAVE,
                this.onBeforeSave.bind(this)
            );

            storage.getEventManager().on(
                require("@dsign/library").storage.Storage.POST_REMOVE,
                this.onPostRemove.bind(this)
            );

            this.getContainer().get('StorageContainerAggregate').set(
                ResourceConfig.STORAGE_SERVICE,
                storage
            );
        });
    }

    /**
     * @param evt
     */
    onBeforeSave(evt) {
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
        require("@dsign/library").fs.Fs.removeDirSync(dirToClear);
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

            resourceEntity.path = new (require("@dsign/library").path.Path)();
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

                    let storage = this.getContainer().get('StorageContainerAggregate').get(ResourceConfig.STORAGE_SERVICE);
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
                ResourceConfig.FILE_HYDRATOR_SERVICE,
                ResourceConfig.getFileEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                ResourceConfig.AUDIO_HYDRATOR_SERVICE,
                ResourceConfig.getAudioEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                ResourceConfig.VIDEO_HYDRATOR_SERVICE,
                ResourceConfig.getVideoEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                ResourceConfig.IMAGE_HYDRATOR_SERVICE,
                ResourceConfig.getImageEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                ResourceConfig.RESOURCE_HYDRATOR_SERVICE,
                ResourceConfig.getResourceHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     * @param container
     */
    static getResourceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.AggregatePropertyHydrator)('type');

        hydrator.addHydratorMap(
            ResourceConfig.getImageEntityHydrator(container),
            ['image/jpeg', 'image/png']
        ).addHydratorMap(
            ResourceConfig.getVideoEntityHydrator(container),
            ['video/mp4', 'video/webm']
        ).addHydratorMap(
            ResourceConfig.getWebComponentEntityHydrator(container),
            ['application/zip', 'text/html', 'application/javascript']
        ).addHydratorMap(
            ResourceConfig.getAudioEntityHydrator(container),
            ['audio/mp3']
        );

        return hydrator;
    }

    /**
     * @param container
     */
    static getFileEntityHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(ResourceConfig.FILE_ENTITY_SERVICE)
        );

        let pathHydratorStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        pathHydratorStrategy.setHydrator(ResourceConfig.getPathHydrator(container));

        hydrator.addValueStrategy('path', pathHydratorStrategy);

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('path')
            .enableHydrateProperty('tags');

        hydrator.enableExtractProperty('id')
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

        let hydrator = ResourceConfig.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(ResourceConfig.VIDEO_ENTITY_SERVICE));

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

        let hydrator = ResourceConfig.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(ResourceConfig.IMAGE_ENTITY_SERVICE));

        hydrator.enableHydrateProperty('dimension');

        hydrator.enableExtractProperty('dimension');

        return hydrator;
    }

    /**
     * @param container
     * @return AbstractHydrator
     */
    static getWebComponentEntityHydrator(container) {

        let hydrator = ResourceConfig.getFileEntityHydrator(container);

        hydrator.enableHydrateProperty('wcName');

        hydrator.enableExtractProperty('wcName');

        return hydrator;
    }


    /**
     * @param container
     * @return AbstractHydrator
     */
    static getAudioEntityHydrator(container) {

        let hydrator = ResourceConfig.getFileEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(ResourceConfig.AUDIO_ENTITY_SERVICE));

        hydrator.enableHydrateProperty('duration');

        hydrator.enableExtractProperty('duration');

        return hydrator;
    }

    /**
     *
     * @param container
     * @return {PropertyHydrator}
     */
    static getPathHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            new (require("@dsign/library").path.Path)()
        );

        hydrator.enableHydrateProperty('directory')
            .enableHydrateProperty('nameFile')
            .enableHydrateProperty('extension');

        hydrator.enableExtractProperty('directory')
            .enableExtractProperty('nameFile')
            .enableExtractProperty('extension');

        return hydrator;
    }
}

module.exports = ResourceConfig;
