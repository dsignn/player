/**
 *
 */
class TimeslotConfig extends require('dsign-library').core.ModuleConfig {

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
        let timeslotHydrator = new dsign.hydrator.PropertyHydrator(
            new Timeslot(),
            {
                'resources' : new dsign.hydrator.strategy.HydratorStrategy(
                    this.getServiceManager().get('HydratorPluginManager').get('resourceHydrator')),
                'virtualMonitorReference' : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())),
                'dataReferences' : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new TimeslotDataReference())),
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

        this.getServiceManager().get('HydratorPluginManager').set(
            'timeslotHydrator',
            timeslotHydrator
        );
    }

    _loadDataServiceInjectorService() {
        this.getServiceManager().set('TimeslotDataInjectorService', new TimeslotDataInjectorServicePluginManager());
    }

    /**
     * @private
     */
    _loadTimeslotSender() {
        this.getServiceManager().get('SenderPluginManager').set('timeslotSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadTimeslotService() {

        this.getServiceManager().get('StoragePluginManager').eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name ===  TimeslotConfig.NAME_SERVICE) {

                    let timeslotService = new TimeslotService(
                        this.getServiceManager().get('StoragePluginManager').get(TimeslotConfig.NAME_SERVICE),
                        this.getServiceManager().get('SenderPluginManager').get('timeslotSender'),
                        this.getServiceManager().get('Timer'),
                        this.getServiceManager().get('TimeslotDataInjectorService')
                    );

                    this.getServiceManager().set('TimeslotService', timeslotService);
                }
            }.bind(this)
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
                            "name": TimeslotConfig.NAME_COLLECTION,
                            "index": [
                                "++id",
                                "name",
                                "status",
                                "duration",
                                "virtualMonitorReference.monitorId",
                                "[virtualMonitorReference.monitorId+name]",
                                "*tags",
                                "rotation"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let TimeslotDexieCollection = require('../timeslot/src/storage/indexed-db/dexie/TimeslotDexieCollection');

                            let storage = new dsign.storage.Storage(
                                new TimeslotDexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    TimeslotConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('timeslotHydrator')
                            );


                            this.getServiceManager().get('StoragePluginManager').set(
                                TimeslotConfig.NAME_SERVICE,
                                storage
                            );
                        }
                    );
                }
            }
        );
    }
}

module.exports = TimeslotConfig;