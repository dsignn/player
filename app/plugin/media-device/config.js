/**
 *
 */
class MediaDeviceConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'media-device.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'media-device.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'media-device'; };

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                }
            }
        }
    }

    /**
     * @private
     */
    _loadHydrator() {

        let hydrator = new PropertyHydrator(
            new MediaDevice()
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('groupId')
            .enableExtractProperty('type');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('groupId')
            .enableHydrateProperty('type');

        this.serviceManager.get('HydratorPluginManager').set(
            'mediaDeviceHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new MediaDevice(),
            {},
            {
                deviceId : 'id',
                kind : 'type',
                label : 'name'
            }
        );

        hydrator.enableExtractProperty('deviceId')
            .enableExtractProperty('label')
            .enableExtractProperty('groupId')
            .enableExtractProperty('kind');

        hydrator.enableHydrateProperty('deviceId')
            .enableHydrateProperty('label')
            .enableHydrateProperty('groupId')
            .enableHydrateProperty('kind');

        this.serviceManager.get('HydratorPluginManager').set(
            'mediaDeviceFromApiApiHydrator',
            hydrator
        );
    }

    /**
     * @private
     */
    _loadStorage() {

        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        serviceManager.eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
                        {
                            "name": MediaDeviceConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "groupId", "type"
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
                                    MediaDeviceConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('mediaDeviceHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                MediaDeviceConfig.NAME_SERVICE,
                                storage
                            );

                            serviceManager.get('TimeslotDataInjectorService')
                                .set('MediaDeviceDataInjector',new MediaDeviceDataInjector(
                                    storage
                                ));

                        }.bind(this)
                    );
                }
            }
        );
    }
}

module.exports = MediaDeviceConfig;