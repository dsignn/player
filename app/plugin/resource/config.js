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
                                "++id", "type", "size", "name"
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

                            storage.eventManager.on(
                                Storage.STORAGE_POST_SAVE,
                                this.onSave.bind(storage)
                            );

                            storage.eventManager.on(
                                Storage.STORAGE_POST_UPDATE,
                                this.onUpdate.bind(storage)
                            );

                            storage.eventManager.on(
                                Storage.STORAGE_POST_REMOVE,
                                this.onRemove.bind(storage)
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
        let videoHydrator = new PropertyHydrator(new Video());
        videoHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('dimension');

        videoHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
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
        let imageHydrator = new PropertyHydrator(new Image());
        imageHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension');

        imageHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
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
        let imageHydrator = new PropertyHydrator(new Audio());
        imageHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('duration');

        imageHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
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
        let genericHydrator = new PropertyHydrator(new GenericFile());

        genericHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('wcName')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('lastModified');

        genericHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('wcName')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('lastModified');

        this.serviceManager.get('HydratorPluginManager').set(
            'genericHydrator',
            genericHydrator
        );
    }

    /**
     * @param evt
     */
    onRemove(evt) {
        let fs = require('fs');

        if (evt.data.type == 'text/html') {
            Utils.removeDir(evt.data.location.path + evt.data.id);
        } else {
            fs.unlink(evt.data.getPath(), function (err) {
                if (err) {
                    //throw err;
                }
            })
        }
    }

    /**
     * @param evt
     */
    onSave(evt) {

        console.log('RESOURCE',evt);

        /**
         * Rename and move resource
         */
        fs.rename(evt.data.getPath(), `${serviceManager.get('Application').getResourcePath()}/${evt.data.id}.${evt.data.getExtension()}`, function (err) {
            if (err) {
                console.error('Rename Error', err);
                // TODO Exception
                return;
            }

            evt.data.location = {
                path: `${serviceManager.get('Application').getResourcePath()}/`,
                name: `${evt.data.id}.${evt.data.getExtension()}`
            };

            if (evt.data.type === "application/zip") {

                let AdmZip = require('adm-zip');
                let fs = require('fs');
                let pathResource = `${serviceManager.get('Application').getResourcePath()}/${evt.data.id}`;

                let zip =  new AdmZip(evt.data.getPath());
                zip.extractAllTo(pathResource, true);
                Utils.move(evt.data.getPath(), `${pathResource}/${evt.data.id}.${evt.data.getExtension()}`);

                if (fs.existsSync(`${pathResource}/package.json`)) {
                    let wcConfig = JSON.parse(
                        fs.readFileSync(`${pathResource}/package.json`).toString()
                    );

                    if (wcConfig.main === undefined) {
                        console.error('Main property not set in package json');
                        // TODO Exception
                        return;
                    }

                    evt.data.location.name = wcConfig.main;
                    evt.data.location.path = `${pathResource}/`;
                    evt.data.type = 'text/html';
                    evt.data.wcName = wcConfig.name;
                } else {
                    // TODO error
                }
            }

            this.update(evt.data);
        }.bind(this));
    }

    /**
     *
     * @param evt
     */
    onUpdate(evt) {
        let fs = require('fs');
        let path = require('path');

        let arrayName = path.win32.basename(evt.data.getPath()).split('.');
        if (arrayName[0] !== 'resource') {
            // Break because the resource is already move
            return;
        }

        let pathName = `${__dirname}/../../storage/resource/`;

        fs.lstat(`${serviceManager.get('Application').getResourcePath()}/${evt.data.id}`, (err, stats) => {

            if(err) {
                fs.readdir(serviceManager.get('Application').getResourcePath(), (error, files) => {
                    if (error) {
                       // throw error;
                    }

                    files.filter(nameFile => nameFile.indexOf(evt.data.id) >= 0).forEach(fileToRemove => {
                        fs.unlink(`${serviceManager.get('Application').getResourcePath()}/${fileToRemove}`, function (err) {
                            if (err) {
                                throw err;
                            }
                        })
                    });
                });
                return;
            }

            if (stats.isDirectory()) {
                Utils.removeDir(`${serviceManager.get('Application').getResourcePath()}/${evt.data.id}`);
            }
        });

        fs.rename(evt.data.getPath(), `${serviceManager.get('Application').getResourcePath()}/${evt.data.id}.${evt.data.getExtension()}` , function (err) {
            if (err) {
                throw err;
            }

            evt.data.location = {
                path: `${serviceManager.get('Application').getResourcePath()}/`,
                name: `${evt.data.id}.${evt.data.getExtension()}`
            };

            if (evt.data.type === "application/zip") {


                let AdmZip = require('adm-zip');
                let fs = require('fs');
                let pathResource = `${serviceManager.get('Application').getResourcePath()}/${evt.data.id}`;

                let zip =  new AdmZip(evt.data.getPath());
                zip.extractAllTo(pathResource, true);
                Utils.move(evt.data.getPath(), `${pathResource}/${evt.data.id}.${evt.data.getExtension()}`);

                if (fs.existsSync(`${pathResource}/package.json`)) {
                    let wcConfig = JSON.parse(
                        fs.readFileSync(`${pathResource}/package.json`).toString()
                    );

                    if (wcConfig.main === undefined) {
                        console.error('Main property not set in package json');
                        // TODO Exception
                        return;
                    }

                    evt.data.location.name = wcConfig.main;
                    evt.data.location.path = `${pathResource}/`;
                    evt.data.type = 'text/html';
                    evt.data.wcName = wcConfig.name;
                } else {
                    // TODO error
                }
            }

            this.update(evt.data);
        }.bind(this));
    }
}

module.exports = ResourceConfig;