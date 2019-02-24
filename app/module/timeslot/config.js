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
            this._loadTimeslotHydrator();
            this._loadStorage();
            this._loadTimeslotSender();
            this._loadTimeslotReceiver();
            this._loadTimeslotService();
            this._loadDataServiceInjectorService();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadTimeslotHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'TimeslotService':
                        this._loadTimeslotService();
                        break;
                    case service[cont] === 'TimeslotReceiver':
                        this._loadTimeslotReceiver();
                        break;
                    case service[cont] === 'TimeslotSender':
                        this._loadTimeslotSender();
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
    _loadTimeslotHydrator() {

        this.getServiceManager().get('HydratorPluginManager').set(
            'timeslotHydrator',
            TimeslotConfig.getTimeslotHydrator()
        );
    }

    /**
     * @return {PropertyHydrator}
     */
    static getTimeslotHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Timeslot(),
            {
                resources : new dsign.hydrator.strategy.HydratorStrategy(
                    ResourceConfig.getResourceHydrator()),
                virtualMonitorReference : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())),
                dataReferences : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new TimeslotDataReference())),
                enableAudio : new dsign.hydrator.strategy.HybridStrategy(
                    dsign.hydrator.strategy.HybridStrategy.BOOLEAN_TYPE,
                    dsign.hydrator.strategy.HybridStrategy.NUMBER_TYPE
                ),
                duration : new dsign.hydrator.strategy.NumberStrategy(),
                binds : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new TimeslotReference())),
            }
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('currentTime')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('context')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('dataReferences')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('filters');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('binds')
            .enableExtractProperty('currentTime')
            .enableExtractProperty('duration')
            .enableExtractProperty('enableAudio')
            .enableExtractProperty('context')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('resources')
            .enableExtractProperty('dataReferences')
            .enableExtractProperty('tags')
            .enableExtractProperty('rotation')
            .enableExtractProperty('filters');

        return hydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    static getTimeslotReferenceHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new TimeslotReference()
        );

        hydrator.enableHydrateProperty('referenceId')
            .enableHydrateProperty('name');

        hydrator.enableExtractProperty('referenceId')
            .enableExtractProperty('name');

        return hydrator;
    }

    /**
     * @private
     */
    _loadDataServiceInjectorService() {
        this.getServiceManager().set('TimeslotDataInjectorService', new TimeslotDataInjectorServicePluginManager());
    }

    /**
     * @private
     */
    _loadTimeslotSender() {
        this.getServiceManager().get('SenderPluginManager').set('TimeslotSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadTimeslotReceiver() {
        this.getServiceManager().get('ReceiverServiceManager').set('TimeslotReceiver', require('electron').ipcRenderer);
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
                        this.getServiceManager().get('SenderPluginManager').get('TimeslotSender'),
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