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
     * @return {PropertyHydrator}
     */
    static getTimeHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Time(),
            {
                hours: new dsign.hydrator.strategy.NumberStrategy(),
                minutes: new dsign.hydrator.strategy.NumberStrategy(),
                seconds: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('hours')
            .enableExtractProperty('minutes')
            .enableExtractProperty('seconds');

        hydrator.enableHydrateProperty('hours')
            .enableHydrateProperty('minutes')
            .enableHydrateProperty('seconds');

        return hydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    static getTimerHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Timer(),
            {
                startAt: new dsign.hydrator.strategy.HydratorStrategy(TimerConfig.getTimeHydrator()),
                endAt: new dsign.hydrator.strategy.HydratorStrategy(TimerConfig.getTimeHydrator()),
                timer: new dsign.hydrator.strategy.HydratorStrategy(TimerConfig.getTimeHydrator()),
                autoStart: new dsign.hydrator.strategy.NumberStrategy()
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('startAt')
            .enableExtractProperty('endAt')
            .enableExtractProperty('type')
            .enableExtractProperty('timer')
            .enableExtractProperty('status')
            .enableExtractProperty('autoStart');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('startAt')
            .enableHydrateProperty('endAt')
            .enableHydrateProperty('type')
            .enableHydrateProperty('timer')
            .enableHydrateProperty('status')
            .enableHydrateProperty('autoStart');

        return hydrator;
    }

    /**
     * @private
     */
    _loadHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'TimerHydrator',
            TimerConfig.getTimerHydrator()
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
                                this.getServiceManager().get('HydratorPluginManager').get('TimerHydrator')
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
            .set('TimerSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadTimerService() {

        this.getServiceManager().get('StoragePluginManager').eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name ===  TimerConfig.NAME_SERVICE) {
                    this.getServiceManager().set('TimerService', new TimerService(
                        this.getServiceManager().get('StoragePluginManager').get(TimerConfig.NAME_SERVICE),
                        this.getServiceManager().get('SenderPluginManager').get('TimerSender'),
                        this.getServiceManager().get('Timer'),
                        )
                    );
                }
            }.bind(this)
        );
    }
}

module.exports = TimerConfig;