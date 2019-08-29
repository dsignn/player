
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
            MediaDeviceConfig.MEDIA_DEVICE_HYDRATOR_SERVICE,
            MediaDeviceConfig.getMediaDeviceHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        /*
        hydrator = new dsign.hydrator.PropertyHydrator(
            new MediaDevice(),
            {},
            {
                kind : 'type',
                label : 'deviceName'
            }
        );

         */

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

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getMediaDeviceChromeApiHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get('MediaDeviceEntity')
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

        return hydrator;
    }
}
module.exports = MediaDeviceConfig;
