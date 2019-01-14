/**
 *
 */
class VideoPanelConfig extends require('dsign-library').core.ModuleConfig {

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
    static get RESOURCE_STORAGE() { return 'video-panel-resource.data'; };

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
    static get RESOURCE_COLLECTION() { return 'video-panel-resource'; };

    /**
     *
     */
    init() {
        this._loadPanelHydrator();
        this._loadVideoPanelHydrator();
        this._loadStorage();

        this._loadPanelResourceHydrator();
        this._loadVideoPanelResourceHydrator();
        this._loadResourceStorage();

        this._loadResourceMosaicHydrator();
        this._loadMonitorMosaicWrapperHydrator();
        this._loadVideoPanelMosaicWrapperHydrator();
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
                            "name": VideoPanelConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "height", "width"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let VideoPanelDexieCollection = require('.//src/storage/indexed-db/dexie/VideoPanelDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new VideoPanelDexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    VideoPanelConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('panelHydrator')
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                VideoPanelConfig.NAME_SERVICE,
                                storage
                            );

                            this.getServiceManager().set(
                                'SidelineResourceGenerator',
                                new SidelineResourceGenerator(
                                    this.getServiceManager().get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE),
                                    this.getServiceManager().get('HydratorPluginManager').get('resourceHydrator'),
                                    this.getServiceManager().get('Application').getBasePath()
                                )
                            );

                        }
                    );
                }
            }
        );
    }

    /**
     * @private
     */
    _loadResourceStorage() {
        this.getServiceManager().eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (evt.data.name === 'DexieManager') {
                    this.getServiceManager().get('DexieManager').pushSchema(
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
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let storage = new dsign.storage.Storage(
                                new dsign.storage.adapter.DexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    VideoPanelConfig.RESOURCE_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('panelResourceHydrator')
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                VideoPanelConfig.RESOURCE_SERVICE,
                                storage
                            );

                            this.getServiceManager().set('VideoPanelResourceService', new VideoPanelResourceService(
                                this.getServiceManager().get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE),
                                this.getServiceManager().get('StoragePluginManager').get(VideoPanelConfig.NAME_SERVICE),
                                this.getServiceManager().get('StoragePluginManager').get(ResourceConfig.NAME_SERVICE),
                                this.getServiceManager().get('HydratorPluginManager').get('monitorMosaicWrapperHydrator'),
                                this.getServiceManager().get('HydratorPluginManager').get('videoPanelMosaicWrapperHydrator'),
                                this.getServiceManager().get('HydratorPluginManager').get('resourceMosaicHydrator'),
                                this.getServiceManager().get('HydratorPluginManager').get('monitorHydrator')
                            ));

                        }
                    );
                }
            }
        );
    }

    /**
     * @private
     */
    _loadVideoPanelMosaicWrapperHydrator() {
        let monitorHydrator = new dsign.hydrator.PropertyHydrator(
            new Monitor(),
        );

        monitorHydrator.enableHydrateProperty('id')
            .enableExtractProperty('id');

        let videoPanelHydrator = new dsign.hydrator.PropertyHydrator(
            new SidelineMosaicWrapper(),
            {
                width: new dsign.hydrator.strategy.NumberStrategy(),
                height: new dsign.hydrator.strategy.NumberStrategy(),
                virtualMonitorReference : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())
                ),
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
            new dsign.hydrator.strategy.HydratorStrategy(monitorHydrator)
        ).addStrategy(
            'sidelines',
            new dsign.hydrator.strategy.HydratorStrategy(videoPanelHydrator)
        );

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoPanelMosaicWrapperHydrator',
            videoPanelHydrator
        );
    }

    /**
     * @private
     */
    _loadMonitorMosaicWrapperHydrator() {

        let monitorMosaicWrapperHydrator = new dsign.hydrator.PropertyHydrator(
            new MonitorMosaicWrapper(),
            {
                width: new dsign.hydrator.strategy.NumberStrategy(),
                height: new dsign.hydrator.strategy.NumberStrategy(),
                virtualMonitorReference : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())
                ),
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
            new dsign.hydrator.strategy.HydratorStrategy(monitorMosaicWrapperHydrator)
        );

        this.getServiceManager().get('HydratorPluginManager').set(
            'monitorMosaicWrapperHydrator',
             monitorMosaicWrapperHydrator
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _getVideoPanelHydrator() {

        let videoPanelHydrator = new dsign.hydrator.PropertyHydrator(
            new VideoPanel(),
            {
                width: new dsign.hydrator.strategy.NumberStrategy(),
                height: new dsign.hydrator.strategy.NumberStrategy(),
                videoPanels : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VideoPanel())
                ),
                virtualMonitorReference : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())
                )
            }
        );

        videoPanelHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('videoPanels')
            .enableHydrateProperty('virtualMonitorReference');

        videoPanelHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('videoPanels')
            .enableExtractProperty('virtualMonitorReference');

        videoPanelHydrator.addStrategy(
            'videoPanel',
            new dsign.hydrator.strategy.HydratorStrategy(videoPanelHydrator)
        );

        return videoPanelHydrator;
    }

    /**
     * @private
     */
    _loadVideoPanelHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoPanelHydrator',
            this._getVideoPanelHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _getPanelHydrator() {

        let panelHydrator = new dsign.hydrator.PropertyHydrator(
            new Panel(),
            {
                videoPanel : new dsign.hydrator.strategy.HydratorStrategy(
                    this._getVideoPanelHydrator()
                ),
            }
        );

        panelHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('videoPanel');

        panelHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('videoPanel');

        return panelHydrator;
    }

    /**
     * @private
     */
    _loadPanelHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'panelHydrator',
            this._getPanelHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _getPanelResourceHydrator() {

        let panelResourceHydrator = this._getPanelHydrator();
        panelResourceHydrator.setObjectPrototype(new PanelResource());

        panelResourceHydrator.addStrategy(
            'resourceReference',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new ResourceReference()))
        ).addStrategy(
            'videoPanel',
            new dsign.hydrator.strategy.HydratorStrategy(this._getVideoPanelResourceHydrator()));

        panelResourceHydrator.enableHydrateProperty('resourceReference')
            .enableHydrateProperty('nested');

        panelResourceHydrator.enableExtractProperty('resourceReference')
            .enableExtractProperty('nested');

        return panelResourceHydrator;
    }

    /**
     * @private
     */
    _loadPanelResourceHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'panelResourceHydrator',
            this._getPanelResourceHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _getVideoPanelResourceHydrator() {

        let videoPanelResourceHydrator = this._getVideoPanelHydrator();
        videoPanelResourceHydrator.setObjectPrototype(new VideoPanelResource());

        videoPanelResourceHydrator.addStrategy(
            'esclude',
            new dsign.hydrator.strategy.HybridStrategy(
                dsign.hydrator.strategy.HybridStrategy.BOOLEAN_TYPE,
                dsign.hydrator.strategy.HybridStrategy.NUMBER_TYPE
            )
        ).addStrategy(
            'resources',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new ResourceReference()))
        ).addStrategy(
            'videoPanels',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new VideoPanelResource()))
        );

        videoPanelResourceHydrator.enableHydrateProperty('esclude')
            .enableHydrateProperty('resources');

        videoPanelResourceHydrator.enableExtractProperty('esclude')
            .enableExtractProperty('resources');

        return videoPanelResourceHydrator;
    }

    /**
     * @private
     */
    _loadVideoPanelResourceHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoPanelResourceHydrator',
            this._getVideoPanelResourceHydrator()
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadResourceMosaicHydrator() {
        let resourceMosaicHydrator = new dsign.hydrator.PropertyHydrator(new ResourceMosaic());

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

        this.getServiceManager().get('HydratorPluginManager').set(
            'resourceMosaicHydrator',
            resourceMosaicHydrator
        );
    }
}

module.exports = VideoPanelConfig;