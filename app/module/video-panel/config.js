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
        this._loadVirtualMonitorMosaicHydrator();
        this._loadPanelMosaicHydrator();
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
                                this.getServiceManager().get('HydratorPluginManager').get('virtualMonitorMosaicHydrator'),
                                this.getServiceManager().get('HydratorPluginManager').get('panelMosaicHydrator'),
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
     * @return {PropertyHydrator}
     */
    static getVideoPanelHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new VideoPanel(),
            {
                width: new dsign.hydrator.strategy.NumberStrategy(),
                height: new dsign.hydrator.strategy.NumberStrategy(),
                virtualMonitorReference : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())
                )
            }
        );

        hydrator.addStrategy(
            'videoPanels',
            new dsign.hydrator.strategy.HydratorStrategy(hydrator)
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('videoPanels')
            .enableHydrateProperty('virtualMonitorReference');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('videoPanels')
            .enableExtractProperty('virtualMonitorReference');

        hydrator.addStrategy(
            'videoPanel',
            new dsign.hydrator.strategy.HydratorStrategy(hydrator)
        );

        return hydrator;
    }

    /**
     * @private
     */
    _loadVideoPanelHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoPanelHydrator',
            VideoPanelConfig.getVideoPanelHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getPanelHydrator() {

        let panelHydrator = new dsign.hydrator.PropertyHydrator(
            new Panel(),
            {
                videoPanel : new dsign.hydrator.strategy.HydratorStrategy(
                    VideoPanelConfig.getVideoPanelHydrator()
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
            VideoPanelConfig.getPanelHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getPanelResourceHydrator() {

        let panelResourceHydrator = VideoPanelConfig.getPanelHydrator();
        panelResourceHydrator.setObjectPrototype(new PanelResource());

        panelResourceHydrator.addStrategy(
            'resourceReference',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new ResourceReference()))
        ).addStrategy(
            'videoPanel',
            new dsign.hydrator.strategy.HydratorStrategy(VideoPanelConfig.getVideoPanelResourceHydrator())
        );

        panelResourceHydrator.enableHydrateProperty('resourceReference');

        panelResourceHydrator.enableExtractProperty('resourceReference');

        return panelResourceHydrator;
    }

    /**
     * @private
     */
    _loadPanelResourceHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'panelResourceHydrator',
            VideoPanelConfig.getPanelResourceHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getVideoPanelResourceHydrator() {

        let hydrator = VideoPanelConfig.getVideoPanelHydrator();
        hydrator.setObjectPrototype(new VideoPanelResource());

        hydrator.addStrategy(
            'singleResource',
            new dsign.hydrator.strategy.HybridStrategy(
                dsign.hydrator.strategy.HybridStrategy.BOOLEAN_TYPE,
                dsign.hydrator.strategy.HybridStrategy.NUMBER_TYPE
            )
        ).addStrategy(
            'resources',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new ResourceReference()))
        ).addStrategy(
            'videoPanels',
            new dsign.hydrator.strategy.HydratorStrategy(hydrator)
        );

        hydrator.enableHydrateProperty('singleResource')
            .enableHydrateProperty('resources');

        hydrator.enableExtractProperty('singleResource')
            .enableExtractProperty('resources');

        return hydrator;
    }

    /**
     * @private
     */
    _loadVideoPanelResourceHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'videoPanelResourceHydrator',
            VideoPanelConfig.getVideoPanelResourceHydrator()
        );
    }

    /**
     *
     * @return {PropertyHydrator}
     * @private
     */
    _loadResourceMosaicHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(new ResourceMosaic());

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('location')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension')
            .enableHydrateProperty('computedWidth');

        hydrator.enableExtractProperty('id')
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
            hydrator
        );
    }

    /**
     * @private
     */
    _loadVirtualMonitorMosaicHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'virtualMonitorMosaicHydrator',
            VideoPanelConfig.getVirtualMonitorMosaicHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getVirtualMonitorMosaicHydrator() {
        let hydrator = MonitorConfig.getVirtualMonitorHydrator();

        hydrator.addStrategy(
            'monitors',
            new dsign.hydrator.strategy.HydratorStrategy(VideoPanelConfig.getMonitorMosaicHydrator())
        );

        return hydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    static getMonitorMosaicHydrator() {
        let hydrator = MonitorConfig.getMonitorHydrator();
        hydrator.setObjectPrototype(new MonitorMosaic());

        hydrator.enableHydrateProperty('progressOffsetX')
            .enableHydrateProperty('progressOffsetY');

        hydrator.enableExtractProperty('progressOffsetX')
            .enableExtractProperty('progressOffsetY');

        return hydrator;
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    static getPanelMosaicHydrator() {
        let hydrator = VideoPanelConfig.getPanelHydrator();

        let videoPanelHydrator = VideoPanelConfig.getVideoPanelHydrator();
        videoPanelHydrator.enableHydrateProperty('comutedWidth')
            .enableExtractProperty('comutedWidth');

        hydrator.addStrategy(
            'videoPanel',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new VideoPanelMosaic()))
        );

        return hydrator;
    }

    /**
     * @private
     */
    _loadPanelMosaicHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'panelMosaicHydrator',
            VideoPanelConfig.getPanelMosaicHydrator()
        );
    }
}

module.exports = VideoPanelConfig;