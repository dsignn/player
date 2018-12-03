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

                            let SidelineDexieCollection = require('../sideline/src/storage/indexed-db/dexie/SidelineDexieCollection');

                            let storage = new Storage(
                                new SidelineDexieCollection(
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
}

module.exports = SidelineConfig;