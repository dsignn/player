/**
 *
 */
class MonitorConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'monitor.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'monitor.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'monitor'; };


    init() {

        this._loadHydrator();
        this._loadMonitorHydrator();
        this._loadStorage();
    }

    /**
     * @private
     */
    _loadHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'virtualMonitorHydrator',
            MonitorConfig.getVirtualMonitorHydrator()
        );

    }

    /**
     * @return {PropertyHydrator}
     */
    static getVirtualMonitorHydrator() {

        let monitorHydrator = MonitorConfig.getMonitorHydrator();

        monitorHydrator.enableExtractProperty('alwaysOnTop');
        monitorHydrator.enableHydrateProperty('alwaysOnTop');

        monitorHydrator.addStrategy(
            'monitors',
            new dsign.hydrator.strategy.HydratorStrategy(MonitorConfig.getMonitorHydrator())
        );

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new VirtualMonitor(),
            {
                'monitors' : new dsign.hydrator.strategy.HydratorStrategy(
                    monitorHydrator
                )
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('enable')
            .enableExtractProperty('monitors');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('monitors');

        return hydrator;
    }

    /**
     * @private
     */
    _loadMonitorHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'monitorHydrator',
            MonitorConfig.getMonitorHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getMonitorHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Monitor(),
            {
                width: new dsign.hydrator.strategy.NumberStrategy(),
                height: new dsign.hydrator.strategy.NumberStrategy(),
                offsetX: new dsign.hydrator.strategy.NumberStrategy(),
                offsetY: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('backgroundColor')
            .enableExtractProperty('polygon')
            .enableExtractProperty('monitors')
            .enableExtractProperty('defaultTimeslotId');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('backgroundColor')
            .enableHydrateProperty('polygon')
            .enableHydrateProperty('monitors')
            .enableHydrateProperty('defaultTimeslotId');

        return hydrator;
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
                            "name": MonitorConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "enable"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let MonitorDexieCollection = require('../monitor/src/storage/indexed-db/dexie/MonitorDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new MonitorDexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    MonitorConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('virtualMonitorHydrator')
                            );


                            this.getServiceManager().get('StoragePluginManager').set(
                                MonitorConfig.NAME_SERVICE,
                                storage
                            );
                        }
                    );
                }
            }
        );
    }
}

module.exports = MonitorConfig;