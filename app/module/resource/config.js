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
        this._loadVideoHydrator();
        this._loadImageHydrator();
        this._loadAudioHydrator();
        this._loadZipHydrator();
        this._loadResourceHydrator();
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

                            let TimeslotDexieCollection = require('../resource/src/storage/indexed-db/dexie/ResourceDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new TimeslotDexieCollection(
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
        console.log(resource);
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
     * @return {AggregatePropertyHydrator}
     */
    static getResourceHydrator() {

        let hydrator = new dsign.hydrator.AggregatePropertyHydrator('type');

        hydrator.addHydratorMap(
            ResourceConfig.getImageHydrator(),
            ['image/jpeg', 'image/png']
        ).addHydratorMap(
            ResourceConfig.getVideoHydrator(),
            ['video/mp4']
        ).addHydratorMap(
            ResourceConfig.getZipHydrator(),
            ['application/zip', 'text/html']
        ).addHydratorMap(
            ResourceConfig.getAudioHydrator(),
            ['audio/mp3']
        );

        return hydrator;
    }

    /**
     * @private
     */
    _loadResourceHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'resourceHydrator',
            ResourceConfig.getResourceHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getVideoHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Video(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );
        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('dimension');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('duration')
            .enableExtractProperty('dimension');

        return hydrator;
    }

    /**
     * @private
     */
    _loadVideoHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoHydrator',
            ResourceConfig.getVideoHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getImageHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Image(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension');

        return hydrator;
    }

    /**
     * @private
     */
    _loadImageHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'imageHydrator',
            ResourceConfig.getImageHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getAudioHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Audio(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('duration');

        return hydrator;
    }

    /**
     * @private
     */
    _loadAudioHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'audioHydrator',
            ResourceConfig.getAudioHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getZipHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new GenericFile(),
            {
                location : new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new LocationPath()))
            }
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('wcName')
            .enableHydrateProperty('type')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('wcName')
            .enableExtractProperty('type')
            .enableExtractProperty('tags')
            .enableExtractProperty('location')
            .enableExtractProperty('lastModified');

        return hydrator;
    }

    /**
     * @private
     */
    _loadZipHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'genericHydrator',
            ResourceConfig.getZipHydrator()
        );
    }
}

module.exports = ResourceConfig;