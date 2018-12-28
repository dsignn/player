/**
 *
 */
class TimerConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'timer.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'timer.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'timer'; };

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
            this._loadTimerSender();
            this._loadTimerService();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'TimerService':
                        this._loadTimerSender();
                        this._loadTimerService();
                        break;
                }
            }
        }
    }

    /**
     * @private
     */
    _loadHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Object(),
            {
                hours: new dsign.hydrator.strategy.NumberStrategy(),
                minutes: new dsign.hydrator.strategy.NumberStrategy(),
                seconds: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        this.getServiceManager().get('HydratorPluginManager').set(
            'dataTimeHydrator',
            hydrator
        );

        hydrator = new dsign.hydrator.PropertyHydrator(
            new Timer(),
            {
                startAt: new dsign.hydrator.strategy.HydratorStrategy(
                    this.getServiceManager().get('HydratorPluginManager').get('dataTimeHydrator')
                ),
                endAt: new dsign.hydrator.strategy.HydratorStrategy(
                    this.getServiceManager().get('HydratorPluginManager').get('dataTimeHydrator')
                ),
                autoStart: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('startAt')
            .enableExtractProperty('endAt')
            .enableExtractProperty('type')
            .enableExtractProperty('status')
            .enableExtractProperty('autoStart');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('startAt')
            .enableHydrateProperty('endAt')
            .enableHydrateProperty('type')
            .enableHydrateProperty('status')
            .enableHydrateProperty('autoStart');

        this.getServiceManager().get('HydratorPluginManager').set(
            'timerHydrator',
            hydrator
        );
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
                            "name": TimerConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "startAt", "endAt", "autoStart"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let TimerDexieCollection = require('../timer/src/storage/indexed-db/dexie/TimerDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new TimerDexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    TimerConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('timerHydrator')
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                TimerConfig.NAME_SERVICE,
                                storage
                            );

                            this.getServiceManager().get('TimeslotDataInjectorService')
                                .set('TimerDataInjector',new TimerDataInjector(
                                    storage,
                                    this.getServiceManager().get('TimerService')
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
    _loadTimerSender() {
        this.getServiceManager().get('SenderPluginManager')
            .set('timerSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadTimerService() {
        this.getServiceManager().set('TimerService', new TimerService(
                this.getServiceManager().get('SenderPluginManager').get('timerSender'),
                this.getServiceManager().get('HydratorPluginManager').get('timerHydrator')
            )
        );
    }
}

module.exports = TimerConfig;