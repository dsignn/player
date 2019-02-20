/**
 *
 */
class TimelineConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'timeline.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'timeline.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'timeline'; };

    /**
     * @param service
     */
    init(service = []) {
        if (service.length === 0) {
            this._loadTimelineHydrator();
            this._loadStorage();
            this._loadTimelineService();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadTimelineHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'TimelineService':
                        this._loadTimelineService();
                        break;
                }
            }
        }
    }

    /**
     * @return {PropertyHydrator}
     */
    static getTimelineHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Timeline(),
            {
                time: new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new Time())
                ),
                timer: new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new Time())
                ),
                timelineItems: new dsign.hydrator.strategy.HydratorStrategy(
                    TimelineConfig.getTimelineItemHydrator()
                )
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('time')
            .enableExtractProperty('timer')
            .enableExtractProperty('context')
            .enableExtractProperty('status')
            .enableExtractProperty('rotation')
            .enableExtractProperty('timelineItems');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('time')
            .enableHydrateProperty('timer')
            .enableHydrateProperty('context')
            .enableHydrateProperty('status')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('timelineItems');

        return hydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    static getTimelineItemHydrator() {
        let hydrator = new dsign.hydrator.PropertyHydrator(
            new TimelineItem(),
            {
                time: new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new Time())
                ),
                timeslotReferences:  new dsign.hydrator.strategy.HydratorStrategy(
                    TimeslotConfig.getTimeslotReferenceHydrator()
                )
            }
        );

        hydrator.enableExtractProperty('timeslotReferences')
            .enableExtractProperty('time');

        hydrator.enableHydrateProperty('timeslotReferences')
            .enableHydrateProperty('time');

        return hydrator;
    }

    /**
     * @private
     */
    _loadTimelineHydrator() {
        this.getServiceManager().get('HydratorPluginManager').set(
            'TimelineHydrator',
            TimelineConfig.getTimelineHydrator()
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
                    // TODO INDEX
                    this.getServiceManager().get('DexieManager').pushSchema(
                        {
                            "name": TimelineConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "time"
                            ]
                        }
                    );

                    /**
                     *
                     */
                    this.getServiceManager().get('DexieManager').onReady(
                        (evt) => {

                            let storage = new dsign.storage.Storage(
                                new dsign.storage.adapter.DexieCollection(
                                    this.getServiceManager().get('DexieManager'),
                                    TimelineConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('TimelineHydrator')
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                TimelineConfig.NAME_SERVICE,
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
    _loadTimelineService() {

        this.getServiceManager().get('StoragePluginManager').eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            function(evt) {
                if (evt.data.name ===  TimelineConfig.NAME_SERVICE) {
                    let timelineService = new TimelineService(
                        this.getServiceManager().get('StoragePluginManager').get(TimeslotConfig.NAME_SERVICE),
                        this.getServiceManager().get('SenderPluginManager').get('TimeslotSender'),
                        this.getServiceManager().get('Timer'),
                        this.getServiceManager().get('TimeslotDataInjectorService'),
                        this.getServiceManager().get('StoragePluginManager').get(TimelineConfig.NAME_SERVICE)
                    );

                    this.getServiceManager().set('TimelineService', timelineService);
                }
            }.bind(this)
        );
    }

}

module.exports = TimelineConfig;