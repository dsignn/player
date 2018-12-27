/**
 *
 */
class ResourceConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'resource.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'resource.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'resource'; };

    /**
     *
     */
    init() {
        this._loadHydrator();
        this._loadStorage();
    }

    _loadStorage() {
        this.getServiceManager().eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (evt.data.name === 'DexieManager') {
                    this.getServiceManager().get('DexieManager').pushSchema(
                        {
                            "name": ResourceConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "type", "size", "name", "*tags"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let storage = new dsign.storage.Storage(
                                new dsign.storage.adapter.DexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    ResourceConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('resourceHydrator')
                            );

                            storage.eventManager.on(dsign.storage.Storage.STORAGE_PRE_SAVE, this.onSave.bind(storage))
                                .on(dsign.storage.Storage.STORAGE_PRE_UPDATE, this.onUpdate.bind(storage))
                                .on(dsign.storage.Storage.STORAGE_PRE_REMOVE, this.onRemove.bind(storage)
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                ResourceConfig.NAME_SERVICE,
                                storage
                            );
                        }
                    );
                }
            }
        );
    }

    /**
     * @param evt
     */
    onRemove(evt) {
        let fs = require('fs');

        if (evt.data.type == 'text/html') {
            let path = evt.data.location.isAbsolute() ?
                evt.data.location.getPath() :
                `${serviceManager.get('Application').getBasePath()}/${evt.data.location.getPath()}`;

            dsign.Utils.removeDirSync(path);
        } else {
            let path = evt.data.location.isAbsolute() ?
                evt.data.getPath() :
                `${serviceManager.get('Application').getBasePath()}/${evt.data.getPath()}`;

            fs.unlinkSync(path);
        }
    }

    /**
     * @param evt
     */
    onSave(evt) {

        if (evt.data.getTmpSourcePath() === null) {
            return;
        }

        let fs = require('fs');

        ResourceConfig._initFileResource(evt.data);

        if (evt.data.type === "application/zip") {
            ResourceConfig._extractZip(evt.data);
        }
    }

    /**
     *
     * @param evt
     */
    onUpdate(evt) {

        if (evt.data.getTmpSourcePath() === null) {
            return;
        }

        let fs = require('fs');

        dsign.Utils.removeDirSync( `${serviceManager.get('Application').getResourcePath()}/${evt.data.id}`);

        ResourceConfig._initFileResource(evt.data);

        if (evt.data.type === "application/zip") {
            ResourceConfig._extractZip(evt.data);
        }
    }

    /**
     * @param {GenericFile} resource
     * @private
     */
    static _initFileResource(resource) {
        fs.mkdirSync(`${serviceManager.get('Application').getResourcePath()}/${resource.id}`);
        fs.copyFileSync(
            resource.getTmpSourcePath().getSource(),
            `${serviceManager.get('Application').getResourcePath()}/${resource.id}/${resource.id}.${resource.getExtension()}`
        );

        resource.location.name = `${resource.id}${require('path').extname(resource.location.name)}`;
        resource.location.path = `${serviceManager.get('Application').getRelativeResourcePath()}/${resource.id}`;
    }

    /**
     * @param {GenericFile} resource
     * @private
     */
    static _extractZip(resource) {
        let fs = require('fs');

        let AdmZip = require('adm-zip');
        let zip =  new AdmZip(`${serviceManager.get('Application').getBasePath()}/${resource.getPath()}`);
        zip.extractAllTo(`${serviceManager.get('Application').getBasePath()}/${resource.location.getPath()}`, true);

        if (fs.existsSync(`${serviceManager.get('Application').getBasePath()}/${resource.location.getPath()}/package.json`)) {
            let wcConfig = JSON.parse(fs.readFileSync(`${serviceManager.get('Application').getBasePath()}/${resource.location.getPath()}/package.json`).toString());

            if (wcConfig.main === undefined) {
                console.error('Main property not set in package json');
                // TODO Exception
                return;
            }

            resource.location.name = wcConfig.main;
            resource.type = 'text/html';
            resource.wcName = wcConfig.name;
        } else {
            // TODO Exception
        }
    }

    /**
     *
     * @return {AggregatePropertyHydrator}
     * @private
     */
    _loadHydrator() {

        this._loadVideoHydrator();
        this._loadImageHydrator();
        this._loadAudioHydrator();
        this._loadZipHydrator();

        let hydrator = new dsign.hydrator.AggregatePropertyHydrator('type');
        hydrator.addHydratorMap(
            this.getServiceManager().get('HydratorPluginManager').get('imageHydrator'),
            ['image/jpeg', 'image/png']
        ).addHydratorMap(
            this.getServiceManager().get('HydratorPluginManager').get('videoHydrator'),
            ['video/mp4']
        ).addHydratorMap(
            this.getServiceManager().get('HydratorPluginManager').get('genericHydrator'),
            ['application/zip', 'text/html']
        ).addHydratorMap(
            this.getServiceManager().get('HydratorPluginManager').get('audioHydrator'),
            ['audio/mp3']
        );

        this.getServiceManager().get('HydratorPluginManager').set(
            'resourceHydrator',
            hydrator
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadVideoHydrator() {
        let videoHydrator = new dsign.hydrator.PropertyHydrator(
            new Video(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );
        videoHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('dimension');

        videoHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('duration')
            .enableExtractProperty('dimension');

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoHydrator',
            videoHydrator
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadImageHydrator() {
        let imageHydrator = new dsign.hydrator.PropertyHydrator(
            new Image(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        )
        ;
        imageHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension');

        imageHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension');

        this.getServiceManager().get('HydratorPluginManager').set(
            'imageHydrator',
            imageHydrator
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadAudioHydrator() {
        let imageHydrator = new dsign.hydrator.PropertyHydrator(
            new Audio(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );

        imageHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration');

        imageHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('duration');

        this.getServiceManager().get('HydratorPluginManager').set(
            'audioHydrator',
            imageHydrator
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _loadZipHydrator() {
        let genericHydrator = new dsign.hydrator.PropertyHydrator(
            new GenericFile(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );

        genericHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('wcName')
            .enableHydrateProperty('type')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified');

        genericHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('wcName')
            .enableExtractProperty('type')
            .enableExtractProperty('tags')
            .enableExtractProperty('location')
            .enableExtractProperty('lastModified');

        this.getServiceManager().get('HydratorPluginManager').set(
            'genericHydrator',
            genericHydrator
        );
    }
}

module.exports = ResourceConfig;