/**
 *
 */
class SidelineConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'sideline.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get RESOURCE_SERVICE() { return 'sideline.resource.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'sideline.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get RESOURCE_STORAGE() { return 'sideline.resource.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'sideline'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get RESOURCE_COLLECTION() { return 'sideline-resource'; };

    /**
     *
     */
    init() {
        this._loadResourceMosaicHydrator();
        this._loadMonitorMosaicWrapperHydrator();
        this._loadSidelineMosaicWrapperHydrator();
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
                            "name": SidelineConfig.NAME_COLLECTION,
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
                                    SidelineConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('sidelineHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                SidelineConfig.NAME_SERVICE,
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
                            "name": SidelineConfig.RESOURCE_COLLECTION,
                            "index": [
                                "++id", "sidelineId", "resourceId"
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
                                    SidelineConfig.RESOURCE_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('sidelineResourceHydrator')
                            );

                            serviceManager.get('StoragePluginManager').set(
                                SidelineConfig.RESOURCE_SERVICE,
                                storage
                            );

                            serviceManager.set('VideoPanelResourceService', new VideoPanelResourceService(
                                serviceManager.get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE),
                                serviceManager.get('StoragePluginManager').get(SidelineConfig.NAME_SERVICE),
                                serviceManager.get('StoragePluginManager').get(ResourceConfig.NAME_SERVICE),
                                serviceManager.get('HydratorPluginManager').get('monitorMosaicWrapperHydrator'),
                                serviceManager.get('HydratorPluginManager').get('sidelineMosaicWrapperHydrator'),
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

        let sidelineHydrator = new PropertyHydrator(
            new Sideline(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                virtualMonitorReference : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
            }
        );

        sidelineHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('sidelines');

        sidelineHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('sidelines');


        sidelineHydrator.addStrategy(
            'monitor',
            new HydratorStrategy(monitorHydrator)
        ).addStrategy(
            'sidelines',
            new HydratorStrategy(sidelineHydrator)
        );


        this.serviceManager.get('HydratorPluginManager').set(
            'sidelineHydrator',
            sidelineHydrator
        );
    }

    /**
     * @private
     */
    _loadResourceHydrator() {
        let sidelineResourceHydrator = new PropertyHydrator(
            new SidelineResource(),
            {
                sidelineReference : new HydratorStrategy(new PropertyHydrator(new SidelineReference()))
            },
        );

        sidelineResourceHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('nameResource')
            .enableHydrateProperty('sidelineReference')
            .enableHydrateProperty('resourcesInSideline');

        sidelineResourceHydrator.enableExtractProperty('id')
            .enableExtractProperty('nameResource')
            .enableExtractProperty('sidelineReference')
            .enableExtractProperty('resourcesInSideline');

        this.serviceManager.get('HydratorPluginManager').set(
            'sidelineResourceHydrator',
            sidelineResourceHydrator
        );
    }

    /**
     * @private
     */
    _loadSidelineMosaicWrapperHydrator() {
        let monitorHydrator = new PropertyHydrator(
            new Monitor(),
        );

        monitorHydrator.enableHydrateProperty('id')
            .enableExtractProperty('id');

        let sidelineHydrator = new PropertyHydrator(
            new SidelineMosaicWrapper(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                virtualMonitorReference : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
            }
        );

        sidelineHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('comutedWidth')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('sidelines');

        sidelineHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('comutedWidth')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('sidelines');


        sidelineHydrator.addStrategy(
            'monitor',
            new HydratorStrategy(monitorHydrator)
        ).addStrategy(
            'sidelines',
            new HydratorStrategy(sidelineHydrator)
        );

        this.serviceManager.get('HydratorPluginManager').set(
            'sidelineMosaicWrapperHydrator',
            sidelineHydrator
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

module.exports = SidelineConfig;