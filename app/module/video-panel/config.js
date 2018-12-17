/**
 *
 */
class VideoPanelConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'video-panel.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get RESOURCE_SERVICE() { return 'video-panel.resource.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'video-panel.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get RESOURCE_STORAGE() { return 'video-panel.resource.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'video-panel'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get RESOURCE_COLLECTION() { return 'videoPanel-resource'; };

    /**
     *
     */
    init() {
        this._loadResourceMosaicHydrator();
        this._loadMonitorMosaicWrapperHydrator();
        this._loadVideoPanelMosaicWrapperHydrator();
        this._loadHydrator();
        this._loadResourceHydrator();
        this._loadStorage();
        this._loadResourceStorage();
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
                            "name": VideoPanelConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "height", "width"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let VideoPanelDexieCollection = require('.//src/storage/indexed-db/dexie/VideoPanelDexieCollection');

                            let storage = new Storage(
                                new VideoPanelDexieCollection(
                                    serviceManager.get('DexieManager'),
                                    VideoPanelConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('videoPanelHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                VideoPanelConfig.NAME_SERVICE,
                                storage
                            );

                            this.serviceManager.set(
                                'SidelineResourceGenerator',
                                new SidelineResourceGenerator(
                                    serviceManager.get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE),
                                    serviceManager.get('HydratorPluginManager').get('resourceHydrator'),
                                    serviceManager.get('Application').getBasePath()
                                )
                            );

                        }.bind(this)
                    );
                }
            }.bind(this)
        );
    }

    /**
     * @private
     */
    _loadResourceStorage() {
        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        serviceManager.eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
                        {
                            "name": VideoPanelConfig.RESOURCE_COLLECTION,
                            "index": [
                                "++id", "videoPanelId", "resourceId"
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
                                    VideoPanelConfig.RESOURCE_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('videoPanelResourceHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                VideoPanelConfig.RESOURCE_SERVICE,
                                storage
                            );

                            serviceManager.set('VideoPanelResourceService', new VideoPanelResourceService(
                                serviceManager.get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE),
                                serviceManager.get('StoragePluginManager').get(VideoPanelConfig.NAME_SERVICE),
                                serviceManager.get('StoragePluginManager').get(ResourceConfig.NAME_SERVICE),
                                serviceManager.get('HydratorPluginManager').get('monitorMosaicWrapperHydrator'),
                                serviceManager.get('HydratorPluginManager').get('videoPanelMosaicWrapperHydrator'),
                                serviceManager.get('HydratorPluginManager').get('resourceMosaicHydrator'),
                                serviceManager.get('HydratorPluginManager').get('monitorHydrator')
                            ));

                        }.bind(this)
                    );
                }
            }.bind(this)
        );
    }

    /**
     * @private
     */
    _loadHydrator() {

        let monitorHydrator = new PropertyHydrator(
            new Monitor(),
        );

        monitorHydrator.enableHydrateProperty('id')
            .enableExtractProperty('id');

        let videoPanelHydrator = new PropertyHydrator(
            new Sideline(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                virtualMonitorReference : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
            }
        );

        videoPanelHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('sidelines');

        videoPanelHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('sidelines');


        videoPanelHydrator.addStrategy(
            'monitor',
            new HydratorStrategy(monitorHydrator)
        ).addStrategy(
            'videoPanels',
            new HydratorStrategy(videoPanelHydrator)
        );


        this.serviceManager.get('HydratorPluginManager').set(
            'videoPanelHydrator',
            videoPanelHydrator
        );
    }

    /**
     * @private
     */
    _loadResourceHydrator() {
        let videoPanelResourceHydrator = new PropertyHydrator(
            new SidelineResource(),
            {
                sidelineReference : new HydratorStrategy(new PropertyHydrator(new SidelineReference()))
            },
        );

        videoPanelResourceHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('nameResource')
            .enableHydrateProperty('sidelineReference')
            .enableHydrateProperty('resourcesInSideline');

        videoPanelResourceHydrator.enableExtractProperty('id')
            .enableExtractProperty('nameResource')
            .enableExtractProperty('sidelineReference')
            .enableExtractProperty('resourcesInSideline');

        this.serviceManager.get('HydratorPluginManager').set(
            'videoPanelResourceHydrator',
            videoPanelResourceHydrator
        );
    }

    /**
     * @private
     */
    _loadVideoPanelMosaicWrapperHydrator() {
        let monitorHydrator = new PropertyHydrator(
            new Monitor(),
        );

        monitorHydrator.enableHydrateProperty('id')
            .enableExtractProperty('id');

        let videoPanelHydrator = new PropertyHydrator(
            new SidelineMosaicWrapper(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                virtualMonitorReference : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
            }
        );

        videoPanelHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('comutedWidth')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('sidelines');

        videoPanelHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('comutedWidth')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('sidelines');


        videoPanelHydrator.addStrategy(
            'monitor',
            new HydratorStrategy(monitorHydrator)
        ).addStrategy(
            'sidelines',
            new HydratorStrategy(videoPanelHydrator)
        );

        this.serviceManager.get('HydratorPluginManager').set(
            'videoPanelMosaicWrapperHydrator',
            videoPanelHydrator
        );
    }

    /**
     * @private
     */
    _loadMonitorMosaicWrapperHydrator() {

        let monitorMosaicWrapperHydrator = new PropertyHydrator(
            new MonitorMosaicWrapper(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                virtualMonitorReference : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
            }
        );

        monitorMosaicWrapperHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('progressOffsetX')
            .enableHydrateProperty('progressOffsetY')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('comutedWidth')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('monitors');

        monitorMosaicWrapperHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('progressOffsetX')
            .enableExtractProperty('progressOffsetY')
            .enableExtractProperty('comutedWidth')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('monitors');


        monitorMosaicWrapperHydrator.addStrategy(
            'monitors',
            new HydratorStrategy(monitorMosaicWrapperHydrator)
        );

        this.serviceManager.get('HydratorPluginManager').set(
            'monitorMosaicWrapperHydrator',
             monitorMosaicWrapperHydrator
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadResourceMosaicHydrator() {
        let resourceMosaicHydrator = new PropertyHydrator(new ResourceMosaic());

        resourceMosaicHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension')
            .enableHydrateProperty('computedWidth');

        resourceMosaicHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('location')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension')
            .enableExtractProperty('computedWidth');

        this.serviceManager.get('HydratorPluginManager').set(
            'resourceMosaicHydrator',
            resourceMosaicHydrator
        );
    }
}

module.exports = VideoPanelConfig;