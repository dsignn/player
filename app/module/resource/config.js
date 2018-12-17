/**
 *
 */
class ResourceConfig extends PluginConfig {

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
        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        serviceManager.eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
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
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let storage = new Storage(
                                new DexieCollection(
                                    serviceManager.get('DexieManager'),
                                    ResourceConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('resourceHydrator')
                            );

                            storage.eventManager.on(Storage.STORAGE_PRE_SAVE, this.onSave.bind(storage))
                                .on(Storage.STORAGE_PRE_UPDATE, this.onUpdate.bind(storage))
                                .on(Storage.STORAGE_PRE_REMOVE, this.onRemove.bind(storage)
                            );

                            serviceManager.get('StoragePluginManager').set(
                                ResourceConfig.NAME_SERVICE,
                                storage
                            );
                        }.bind(this)
                    );
                }
            }.bind(this)
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

            Utils.removeDirSync(path);
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

        Utils.removeDirSync( `${serviceManager.get('Application').getResourcePath()}/${evt.data.id}`);

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

        let hydrator = new AggregatePropertyHydrator('type');
        hydrator.addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('imageHydrator'),
            ['image/jpeg', 'image/png']
        ).addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('videoHydrator'),
            ['video/mp4']
        ).addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('genericHydrator'),
            ['application/zip', 'text/html']
        ).addHydratorMap(
            this.serviceManager.get('HydratorPluginManager').get('audioHydrator'),
            ['audio/mp3']
        );

        this.serviceManager.get('HydratorPluginManager').set(
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
        let videoHydrator = new PropertyHydrator(
            new Video(),
            {
                location : new HydratorStrategy(new PropertyHydrator(new LocationPath()))
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

        this.serviceManager.get('HydratorPluginManager').set(
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
        let imageHydrator = new PropertyHydrator(
            new Image(),
            {
                location : new HydratorStrategy(new PropertyHydrator(new LocationPath()))
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

        this.serviceManager.get('HydratorPluginManager').set(
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
        let imageHydrator = new PropertyHydrator(
            new Audio(),
            {
                location : new HydratorStrategy(new PropertyHydrator(new LocationPath()))
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

        this.serviceManager.get('HydratorPluginManager').set(
            'audioHydrator',
            imageHydrator
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _loadZipHydrator() {
        let genericHydrator = new PropertyHydrator(
            new GenericFile(),
            {
                location : new HydratorStrategy(new PropertyHydrator(new LocationPath()))
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

        this.serviceManager.get('HydratorPluginManager').set(
            'genericHydrator',
            genericHydrator
        );
    }
}

module.exports = ResourceConfig;