/**
 *
 */
class MediaDeviceConfig extends require('dsign-library').core.ModuleConfig {

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

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new MediaDevice()
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('groupId')
            .enableExtractProperty('deviceName')
            .enableExtractProperty('type');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('groupId')
            .enableHydrateProperty('deviceName')
            .enableHydrateProperty('type');

        this.getServiceManager().get('HydratorPluginManager').set(
            'mediaDeviceHydrator',
            hydrator
        );

        hydrator = new dsign.hydrator.PropertyHydrator(
            new MediaDevice(),
            {},
            {
                kind : 'type',
                label : 'deviceName'
            }
        );

        hydrator.enableExtractProperty('deviceId')
            .enableExtractProperty('label')
            .enableExtractProperty('name')
            .enableExtractProperty('groupId')
            .enableExtractProperty('kind');

        hydrator.enableHydrateProperty('deviceId')
            .enableHydrateProperty('label')
            .enableHydrateProperty('name')
            .enableHydrateProperty('groupId')
            .enableHydrateProperty('kind');

        this.getServiceManager().get('HydratorPluginManager').set(
            'mediaDeviceFromApiApiHydrator',
            hydrator
        );
    }

    /**
     * @private
     */
    _loadStorage() {
        this.getServiceManager().eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (evt.data.name === 'DexieManager') {
                    this.getServiceManager().get('DexieManager').pushSchema(
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
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let storage = new dsign.storage.Storage(
                                new dsign.storage.adapter.DexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    MediaDeviceConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('mediaDeviceHydrator')
                            );


                            this.getServiceManager().get('StoragePluginManager').set(
                                MediaDeviceConfig.NAME_SERVICE,
                                storage
                            );

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('MediaDeviceDataInjector',new MediaDeviceDataInjector(
                                    storage
                                ));

                        }
                    );
                }
            }
        );
    }
}

module.exports = MediaDeviceConfig;