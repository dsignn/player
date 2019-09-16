
/**
 * Config file to load services
 */
class MediaDeviceConfig extends require("@dsign/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get MEDIA_DEVICE_ENTITY_SERVICE() { return 'MediaDeviceEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MEDIA_DEVICE_HYDRATOR_SERVICE() { return 'MediaDeviceEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'MediaDeviceStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'media-device'; };


    /**
     * @return {string}
     * @constructor
     */
    static get MEDIA_DEVICE_CHROME_API_HYDRATOR_SERVICE() { return 'MediaDeviceEntityChromeApiHydrator'; };

    init() {

        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initMongoStorage();
    }


    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(MediaDeviceConfig.MEDIA_DEVICE_ENTITY_SERVICE, new MediaDeviceEntity());
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('media-device');
            aclService.adapter.acl.allow('guest', 'media-device');
        }
    }

    /**
     * @private
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            MediaDeviceConfig.MEDIA_DEVICE_HYDRATOR_SERVICE,
            MediaDeviceConfig.getMediaDeviceHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            MediaDeviceConfig.MEDIA_DEVICE_CHROME_API_HYDRATOR_SERVICE,
            MediaDeviceConfig.getMediaDeviceChromeApiHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimeslotAdapter(this.getContainer().get('MongoDb'), MediaDeviceConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(MediaDeviceConfig.MEDIA_DEVICE_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                MediaDeviceConfig.STORAGE_SERVICE,
                storage
            );

            this.getContainer().get(TimeslotConfig.TIMESLOT_INJECTOR_DATA_SERVICE)
                .set(
                    'MediaDeviceDataInjector',
                    new MediaDeviceDataInjector(storage)
                );
        };


        if (!this.getContainer().get('MongoDb')) {
            return;
        }


        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(
                require("@dsign/library").storage.adapter.mongo.MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }


    /**
     * @param {ContainerInterface}   container
     * @return {PropertyHydrator}
     */
    static getMediaDeviceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get('MediaDeviceEntity')
        );

        hydrator.addPropertyStrategy(
            'id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        ).addPropertyStrategy(
            '_id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        );

        hydrator.addValueStrategy('id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)())
            .addValueStrategy('_id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)());

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('groupId')
            .enableExtractProperty('deviceName')
            .enableExtractProperty('deviceId')
            .enableExtractProperty('type');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('groupId')
            .enableHydrateProperty('deviceName')
            .enableHydrateProperty('deviceId')
            .enableHydrateProperty('type');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getMediaDeviceChromeApiHydrator(container) {

        let hydrator = MediaDeviceConfig.getMediaDeviceHydrator(container);

        hydrator.addPropertyStrategy(
            'kind',
            new  (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('type', 'type')
        ).addPropertyStrategy(
            'label',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('deviceName', 'label')
        ).addPropertyStrategy(
            'deviceName',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('deviceName', 'label')
        );

        hydrator.enableExtractProperty('label')
            .enableExtractProperty('kind');

        hydrator.enableHydrateProperty('label')
            .enableHydrateProperty('kind');

        return hydrator;
    }
}
module.exports = MediaDeviceConfig;
