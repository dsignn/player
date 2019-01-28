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
            this._loadHydrator();
            this._loadStorage();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
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
            new Timeline()
        );

        this.getServiceManager().get('HydratorPluginManager').set(
            'timelineHydrator',
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
                    // TODO INDEX
                    this.getServiceManager().get('DexieManager').pushSchema(
                        {
                            "name": TimelineConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "place", "date", "homeTeam", "guestTeam", "enable", "status"
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
                                serviceManager.get('HydratorPluginManager').get('timelineHydrator')
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
}

module.exports = TimelineConfig;