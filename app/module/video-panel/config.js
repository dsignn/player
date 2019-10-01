/**
 * @class VideoPanelConfig
 */
class VideoPanelConfig extends require("@dsign/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_CONTAINER_ENTITY_SERVICE() { return 'VideoPanelContainerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_EMBEDDED_SERVICE() { return 'VideoPanel'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_ENTITY_SERVICE() { return 'VideoPanelResourceEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE() { return 'VideoPanelContainerEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_HYDRATOR_SERVICE() { return 'VideoPanelHydrator'; };


    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE() { return 'VideoPanelResourceEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_COLLECTION() { return 'video-panel'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_STORAGE_SERVICE() { return 'VideoPanelStorage'; };

    init() {

        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initVideoPanelMongoStorage();
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.VIDEOPANEL_CONTAINER_ENTITY_SERVICE, new VideoPanelContainerEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.VIDEOPANEL_RESOURCE_ENTITY_SERVICE, new VideoPanelResourceEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.VIDEOPANEL_EMBEDDED_SERVICE, new VideoPanel());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.VIDEOPANEL_HYDRATOR_SERVICE,
            VideoPanelConfig.getVideoPanelHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.VIDEOPANEL_CONTAINER_ENTITY_SERVICE,
            VideoPanelConfig.getVideoPanelContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }


    /**
     *
     */
    initVideoPanelMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoVideoPanelAdapter(this.getContainer().get('MongoDb'), VideoPanelConfig.VIDEOPANEL_COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(VideoPanelConfig.VIDEOPANEL_CONTAINER_ENTITY_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                VideoPanelConfig.VIDEOPANEL_STORAGE_SERVICE,
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
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('video-panel');
            aclService.adapter.acl.allow('guest', 'video-panel');
        }
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelContainerEntityHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(VideoPanelConfig.VIDEOPANEL_CONTAINER_ENTITY_SERVICE),
            {
                id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                _id : new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                videoPanel : new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    VideoPanelConfig.getVideoPanelHydrator(container)
                ),
            },
            {
                'id': new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id'),
                '_id': new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
            }
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('videoPanel');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('videoPanel');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(VideoPanelConfig.VIDEOPANEL_EMBEDDED_SERVICE),
            {
                id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                 _id : new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                width: new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)(),
                height: new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)(),
                monitorContainerReference: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    MonitorConfig.getMonitorContainerReferenceHydrator(container)
                )
            },
            {
                'id': new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id'),
                '_id': new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
            }
        );

        hydrator.addValueStrategy(
            'videoPanels',
            new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(hydrator)
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('videoPanels')
            .enableHydrateProperty('monitorContainerReference');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('videoPanels')
            .enableExtractProperty('monitorContainerReference');


        return hydrator;
    }

}
module.exports = VideoPanelConfig;
