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

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadMonitorHydrator();
            this._loadStorage();
            this._loadMonitorSender();
            this._loadMonitorService();
            this._loadMonitorReceiver();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        this._loadMonitorHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'MonitorSender':
                        this._loadMonitorSender();
                        break;
                    case service[cont] === 'MonitorService':
                        this._loadMonitorService();
                        break;
                    case service[cont] === 'MonitorReceiver':
                        this._loadMonitorReceiver();
                        break;
                }
            }
        }
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
                'monitors' : new dsign.hydrator.strategy.HydratorStrategy(monitorHydrator),
                'enable' : new dsign.hydrator.strategy.HybridStrategy(
                    dsign.hydrator.strategy.HybridStrategy.BOOLEAN_TYPE,
                    dsign.hydrator.strategy.HybridStrategy.NUMBER_TYPE
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
                offsetY: new dsign.hydrator.strategy.NumberStrategy(),
                polygon: new dsign.hydrator.strategy.NullStrategy()
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

    /**
     * @private
     */
    _loadMonitorSender() {
        this.getServiceManager().get('SenderPluginManager').set('MonitorSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadMonitorReceiver() {
        this.getServiceManager().get('ReceiverServiceManager').set('MonitorReceiver', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadMonitorService() {
        this.getServiceManager().get('StoragePluginManager').eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (MonitorConfig.NAME_SERVICE === evt.data.name) {
                    this.getServiceManager().set(
                        'MonitorService',
                        new MonitorService(
                            this.getServiceManager().get('StoragePluginManager').get(MonitorConfig.NAME_SERVICE),
                            this.getServiceManager().get('SenderPluginManager').get('MonitorSender')
                        )
                    );
                }
            })
    }
}

module.exports = MonitorConfig;