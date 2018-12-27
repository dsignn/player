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
        this._loadStorage();
    }

    _loadHydrator() {


        let monitorHydrator = this._getMonitoHydrator();

        monitorHydrator.enableExtractProperty('alwaysOnTop');
        monitorHydrator.enableHydrateProperty('alwaysOnTop');

        monitorHydrator.addStrategy(
            'monitors',
            new dsign.hydrator.strategy.HydratorStrategy(this._getMonitoHydrator())
        );

        this.getServiveManager().get('HydratorPluginManager').set(
            'monitorHydrator',
            monitorHydrator
        );

        let virtualMonitorHydrator = new dsign.hydrator.PropertyHydrator(
            new VirtualMonitor(),
            {
                'monitors' : new dsign.hydrator.strategy.HydratorStrategy(
                    monitorHydrator
                )
            }
        );

        virtualMonitorHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('enable')
            .enableExtractProperty('monitors');

        virtualMonitorHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('monitors');

        this.getServiveManager().get('HydratorPluginManager').set(
            'virtualMonitorHydrator',
            virtualMonitorHydrator
        );

    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    _getMonitoHydrator() {
        let monitorHydrator = new dsign.hydrator.PropertyHydrator(
            new Monitor(),
            {
                width: new dsign.hydrator.strategy.NumberStrategy(),
                height: new dsign.hydrator.strategy.NumberStrategy(),
                offsetX: new dsign.hydrator.strategy.NumberStrategy(),
                offsetY: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        monitorHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('backgroundColor')
            .enableExtractProperty('polygon')
            .enableExtractProperty('monitors')
            .enableExtractProperty('defaultTimeslotId');

        monitorHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('backgroundColor')
            .enableHydrateProperty('polygon')
            .enableHydrateProperty('monitors')
            .enableHydrateProperty('defaultTimeslotId');

        return monitorHydrator;
    }

    _loadStorage() {
        this.getServiveManager().eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (evt.data.name === 'DexieManager') {
                    this.getServiveManager().get('DexieManager').pushSchema(
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
                    this.getServiveManager().get('DexieManager').onReady(
                        (evt) => {

                            let MonitorDexieCollection = require('../monitor/src/storage/indexed-db/dexie/MonitorDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new MonitorDexieCollection(
                                    this.getServiveManager().get('DexieManager'),
                                    MonitorConfig.NAME_COLLECTION
                                ),
                                this.getServiveManager().get('HydratorPluginManager').get('virtualMonitorHydrator')
                            );


                            this.getServiveManager().get('StoragePluginManager').set(
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