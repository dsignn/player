/**
 *
 */
class MonitorConfig extends require('dsign-library').ModuleConfig {

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

        this.serviceManager.get('HydratorPluginManager').set(
            'monitorHydrator',
            monitorHydrator
        );

        let virtualMonitorHydrator = new dsign.hydrator.PropertyHydrator(
            new VirtualMonitor(),
            {
                'monitors' :  new dsign.hydrator.strategy.HydratorStrategy(
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

        this.serviceManager.get('HydratorPluginManager').set(
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
        let indexedDBConfig =  this.serviceManager.get('Config')['indexedDB'];

        this.serviceManager.eventManager.on(
            dsign.ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name === 'DexieManager') {
                    serviceManager.get('DexieManager').pushSchema(
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
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let MonitorDexieCollection = require('../monitor/src/storage/indexed-db/dexie/MonitorDexieCollection');

                            let storage = new Storage(
                                new MonitorDexieCollection(
                                    serviceManager.get('DexieManager'),
                                    MonitorConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('virtualMonitorHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                MonitorConfig.NAME_SERVICE,
                                storage
                            );
                        }.bind(this)
                    );
                }
            }
        );
    }
}

module.exports = MonitorConfig;