/**
 *
 */
class TimeslotConfig extends PluginConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'timeslot.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'timeslot.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'timeslot'; };

    /**
     * @param service
     */
    init(service = []) {

        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
            this._loadTimeslotSender();
            this._loadTimeslotService();
            this._loadDataServiceInjectorService();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'TimeslotService':
                        this._loadTimeslotSender();
                        this._loadTimeslotService();
                        break;
                    case service[cont] === 'TimeslotDataInjectorService':
                        this._loadDataServiceInjectorService();
                        break;
                }
            }
        }
    }

    /**
     * @private
     */
    _loadHydrator() {
        let timeslotHydrator = new PropertyHydrator(
            new Timeslot(),
            {
                'resources' : new HydratorStrategy(this.serviceManager.get('HydratorPluginManager').get('resourceHydrator')),
                'virtualMonitorReference' : new HydratorStrategy(new PropertyHydrator(new VirtualMonitorReference())),
                'dataReferences' : new HydratorStrategy(new PropertyHydrator(new TimeslotDataReference())),
            }
        );

        timeslotHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('currentTime')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('context')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('dataReferences')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('filters');

        timeslotHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('binds')
            .enableExtractProperty('currentTime')
            .enableExtractProperty('duration')
            .enableExtractProperty('context')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('resources')
            .enableExtractProperty('dataReferences')
            .enableExtractProperty('tags')
            .enableExtractProperty('rotation')
            .enableExtractProperty('filters');

        this.serviceManager.get('HydratorPluginManager').set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }

    _loadDataServiceInjectorService() {
        let timeslotDataInjectorServicePluginManager = new TimeslotDataInjectorServicePluginManager();
        this.serviceManager.set('TimeslotDataInjectorService', timeslotDataInjectorServicePluginManager);
    }

    /**
     * @private
     */
    _loadTimeslotSender() {
        this.serviceManager.get('SenderPluginManager')
            .set('timeslotSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadTimeslotService() {

        serviceManager.get('StoragePluginManager').eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name ===  TimeslotConfig.NAME_SERVICE) {

                    let timeslotService = new TimeslotService(
                        this.serviceManager.get('SenderPluginManager').get('timeslotSender'),
                        this.serviceManager.get('StoragePluginManager').get(TimeslotConfig.NAME_SERVICE),
                        this.serviceManager.get('Timer')
                    );

                    this.serviceManager.set('TimeslotService', timeslotService);
                }
            }.bind(this)
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
                            "name": TimeslotConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "status", "duration", "virtualMonitorReference", "*tags", "rotation"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let TimeslotDexieCollection = require('../timeslot/src/storage/indexed-db/dexie/TimeslotDexieCollection');

                            let storage = new Storage(
                                new TimeslotDexieCollection(
                                    serviceManager.get('DexieManager'),
                                    TimeslotConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('timeslotHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                TimeslotConfig.NAME_SERVICE,
                                storage
                            );
                        }.bind(this)
                    );
                }
            }
        );
    }
}

module.exports = TimeslotConfig;