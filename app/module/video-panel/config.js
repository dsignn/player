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
    static get MONITOR_MOSAIC_EMBEDDED_SERVICE() { return 'MonitorMosaic'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_MOSAIC_EMBEDDED_SERVICE() { return 'VideoPanelMosaic'; };

    /**
     * @return {string}
     * @constructor
     */
    static get RESOURCE_MOSAIC_EMBEDDED_SERVICE() { return 'ResourceMosaic'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_EMBEDDED_SERVICE() { return 'VideoPanel'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE() { return 'VideoPanelResource'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_CONTAINER_ENTITY_SERVICE() { return 'VideoPanelResourceContainerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE() { return 'VideoPanelContainerEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_TO_VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE() { return 'VideoPanelToVideoPanelResourceContainerHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_CONTAINER_HYDRATOR_SERVICE() { return 'VideoPanelResourceContainerHydrator'; };


    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE() { return 'VideoPanelResourceEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  MONITOR_CONTAINER_MOSAIC_HYDRATOR_SERVICE() { return 'MonitorContainerMosaicHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_CONTAINER_MOSAIC_HYDRATOR_SERVICE() { return 'VideoPanelContainerMosaicHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  RESOURCE_MOSAIC_HYDRATOR_SERVICE() { return 'ResourceMosaicHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_COLLECTION() { return 'video-panel'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_COLLECTION() { return 'video-panel-resource'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_STORAGE_SERVICE() { return 'VideoPanelStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_SERVICE() { return 'VideoPanelService'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_STORAGE_SERVICE() { return 'VideoPanelResourceStorage'; };

    init() {

        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initVideoPanelMongoStorage();
        this.initVideoPanelResourceMongoStorage();
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
            .set(VideoPanelConfig.VIDEOPANEL_RESOURCE_CONTAINER_ENTITY_SERVICE, new VideoPanelResourceContainerEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.VIDEOPANEL_EMBEDDED_SERVICE, new VideoPanel());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE, new VideoPanelResource());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.MONITOR_MOSAIC_EMBEDDED_SERVICE, new MonitorMosaic());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.VIDEOPANEL_MOSAIC_EMBEDDED_SERVICE, new VideoPanelMosaic());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(VideoPanelConfig.RESOURCE_MOSAIC_EMBEDDED_SERVICE, new ResourceMosaic());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.VIDEOPANEL_RESOURCE_CONTAINER_HYDRATOR_SERVICE,
            VideoPanelConfig.getVideoPanelResourceContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE,
            VideoPanelConfig.getVideoPanelContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.VIDEOPANEL_TO_VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE,
            VideoPanelConfig.geVideoPanelToVideoPanelResourceHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.MONITOR_CONTAINER_MOSAIC_HYDRATOR_SERVICE,
            VideoPanelConfig.getMonitorContainerEntityForMosaicHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.VIDEOPANEL_CONTAINER_MOSAIC_HYDRATOR_SERVICE,
            VideoPanelConfig.getVideoPanelContainerForMosaicHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            VideoPanelConfig.RESOURCE_MOSAIC_HYDRATOR_SERVICE,
            VideoPanelConfig.getResourceMosaicHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }

    /**
     *
     */
    initVideoPanelMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoVideoPanelAdapter(this.getContainer().get('MongoDb'), VideoPanelConfig.VIDEOPANEL_COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(VideoPanelConfig.VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                VideoPanelConfig.VIDEOPANEL_STORAGE_SERVICE,
                storage
            );

            this.initVideoPanelService();
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
    initVideoPanelResourceMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoVideoPanelResourceAdapter(this.getContainer().get('MongoDb'), VideoPanelConfig.VIDEOPANEL_RESOURCE_COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(VideoPanelConfig.VIDEOPANEL_RESOURCE_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                VideoPanelConfig.VIDEOPANEL_RESOURCE_STORAGE_SERVICE,
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
    initVideoPanelService() {

        this.getContainer().set(
            VideoPanelConfig.VIDEOPANEL_SERVICE,
            new VideoPanelService(
                this.getContainer().get('StorageContainerAggregate').get(MonitorConfig.STORAGE_SERVICE),
                this.getContainer().get('StorageContainerAggregate').get(VideoPanelConfig.VIDEOPANEL_STORAGE_SERVICE),
                this.getContainer().get('StorageContainerAggregate').get(ResourceConfig.STORAGE_SERVICE),
                this.getContainer().get('HydratorContainerAggregate').get(VideoPanelConfig.MONITOR_CONTAINER_MOSAIC_HYDRATOR_SERVICE),
                this.getContainer().get('HydratorContainerAggregate').get(VideoPanelConfig.VIDEOPANEL_CONTAINER_MOSAIC_HYDRATOR_SERVICE),
                this.getContainer().get('HydratorContainerAggregate').get(VideoPanelConfig.RESOURCE_MOSAIC_HYDRATOR_SERVICE),
                this.getContainer().get('ResourceService')
            )
        );
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
    static getVideoPanelResourceContainerEntityHydrator(container) {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(VideoPanelConfig.VIDEOPANEL_RESOURCE_CONTAINER_ENTITY_SERVICE),
            {
                id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                _id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                resourceReference: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    ResourceConfig.getResourceReferenceHydrator(container)
                ),
                videoPanelResource: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    VideoPanelConfig.getVideoPanelResourceHydrator(container)
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
            .enableHydrateProperty('videoPanelResource')
            .enableHydrateProperty('resourceReference');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('videoPanelResource')
            .enableExtractProperty('resourceReference');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelResourceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(VideoPanelConfig.VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE),
            {
                id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                _id : new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                resourceReference: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    ResourceConfig.getResourceHydrator(container)
                ),
                videoPanelReference: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    VideoPanelConfig.geVideoPanelContainerReferenceHydrator(container)
                )
            },
            {
                'id': new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id'),
                '_id': new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id'),

            }
        );

        hydrator.addValueStrategy(
            'videoPanelResources',
            new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(hydrator)
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('videoPanelReference')
            .enableHydrateProperty('videoPanelResources');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('resources')
            .enableExtractProperty('videoPanelReference')
            .enableExtractProperty('videoPanelResources');

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

    /**
     * @param {ContainerInterface} container
     * @return {HydratorInterface}
     */
    static geVideoPanelContainerReferenceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get('EntityNestedReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name')
            .enableHydrateProperty('parentId')
            .enableHydrateProperty('parentName');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name')
            .enableExtractProperty('parentId')
            .enableExtractProperty('parentName');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {HydratorInterface}
     */
    static geVideoPanelToVideoPanelResourceHydrator(container) {

        let hydrator = new VideoPanelToVideoPanelResourceHydrator();
        hydrator.setTemplateObjectHydration(container.get(VideoPanelConfig.VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE));

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getMonitorContainerEntityForMosaicHydrator(container) {
        let hydrator = MonitorConfig.getMonitorContainerEntityHydrator(container);

        hydrator.addValueStrategy(
            'monitors',
            new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(VideoPanelConfig.getMonitorMosaicHydrator(container))
        );

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getMonitorMosaicHydrator(container) {
        let hydrator = MonitorConfig.getMonitorEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(VideoPanelConfig.MONITOR_MOSAIC_EMBEDDED_SERVICE));

        hydrator.addValueStrategy(
                'monitors',
                new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(hydrator)
            )
            .addValueStrategy('progressOffsetX', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)())
            .addValueStrategy('progressOffsetY', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)());

        hydrator.enableHydrateProperty('progressOffsetX')
            .enableHydrateProperty('progressOffsetY');

        hydrator.enableExtractProperty('progressOffsetX')
            .enableExtractProperty('progressOffsetY');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getVideoPanelContainerForMosaicHydrator(container) {

        let hydrator = VideoPanelConfig.getVideoPanelContainerEntityHydrator(container);

        hydrator.addValueStrategy(
            'videoPanel',
            new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(VideoPanelConfig.getVideoPanelMosaicHydrator(container))
        );

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getVideoPanelMosaicHydrator(container) {

        let hydrator = VideoPanelConfig.getVideoPanelHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(VideoPanelConfig.VIDEOPANEL_MOSAIC_EMBEDDED_SERVICE));

        hydrator.addValueStrategy(
            'videoPanels',
            new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(hydrator)
        );

        hydrator.enableHydrateProperty('computedWidth')
            .enableExtractProperty('computedWidth');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getResourceMosaicHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(VideoPanelConfig.RESOURCE_MOSAIC_EMBEDDED_SERVICE),
        );

        let pathHydratorStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        pathHydratorStrategy.setHydrator(ResourceConfig.getPathHydrator(container));

        hydrator.addValueStrategy('path', pathHydratorStrategy)


        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('path')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension')
            .enableHydrateProperty('computedWidth');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('path')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension')
            .enableExtractProperty('computedWidth');

       return hydrator;
    }
}
module.exports = VideoPanelConfig;
