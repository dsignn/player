/**
 *
 */
class TimerConfig extends PluginConfig {

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

        let hydrator = new PropertyHydrator(
            new Object(),
            {
                hours: new NumberStrategy(),
                minutes: new NumberStrategy(),
                seconds: new NumberStrategy()
            }
        );

        this.serviceManager.get('HydratorPluginManager').set(
            'dataTimeHydrator',
            hydrator
        );

        hydrator = new PropertyHydrator(
            new Timer(),
            {
                startAt: new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('dataTimeHydrator')
                ),
                endAt: new HydratorStrategy(
                    this.serviceManager.get('HydratorPluginManager').get('dataTimeHydrator')
                ),
                autoStart: new NumberStrategy()
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

        this.serviceManager.get('HydratorPluginManager').set(
            'timerHydrator',
            hydrator
        );
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
                            "name": TimerConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "startAt", "endAt", "autoStart"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let TimerDexieCollection = require('../timer/src/storage/indexed-db/dexie/TimerDexieCollection');

                            let storage = new Storage(
                                new TimerDexieCollection(
                                    serviceManager.get('DexieManager'),
                                    TimerConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('timerHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                TimerConfig.NAME_SERVICE,
                                storage
                            );

                            serviceManager.get('TimeslotDataInjectorService')
                                .set('TimerDataInjector',new TimerDataInjector(
                                    storage,
                                    serviceManager.get('TimerService')
                                ));

                        }.bind(this)
                    );
                }
            }
        );
    }

    /**
     * @private
     */
    _loadTimerSender() {
        this.serviceManager.get('SenderPluginManager')
            .set('timerSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadTimerService() {
        this.serviceManager.set('TimerService', new TimerService(
            this.serviceManager.get('SenderPluginManager').get('timerSender'),
            this.serviceManager.get('HydratorPluginManager').get('timerHydrator')
            )
        );
    }
}

module.exports = TimerConfig;