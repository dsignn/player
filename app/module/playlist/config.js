/**
 *
 */
class PlaylistConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_SERVICE() { return 'playlist.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'playlist.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'playlist'; };


    /**
     *
     */
    init(service = []) {
        if (service.length === 0) {
            this._loadHydrator();
            this._loadStorage();
            this._loadPlaylistSender();
            this._loadPlaylistService();
        } else {
            for (let cont = 0; service.length > cont; cont++) {
                switch (true) {
                    case service[cont] === 'Hydrator':
                        this._loadHydrator();
                        break;
                    case service[cont] === 'Storage':
                        this._loadStorage();
                        break;
                    case service[cont] === 'PlaylistService':
                        this._loadPlaylistSender();
                        this._loadPlaylistService();
                        break;
                }
            }
        }
    }

    /**
     * @return {AggregatePropertyHydrator}
     * @private
     */
    _loadHydrator() {

        let timeslotReferenceHydrator = TimeslotConfig.getTimeslotReferenceHydrator();
        timeslotReferenceHydrator.setObjectPrototype(new TimeslotPlaylistReference());
        timeslotReferenceHydrator.addStrategy(
            'virtualMonitorReference',
            new dsign.hydrator.strategy.HydratorStrategy(new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference()))
        );

        timeslotReferenceHydrator.enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('duration')
            .enableExtractProperty('currentTime')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('currentTime');

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Playlist(),
            {
                timeslots : new dsign.hydrator.strategy.HydratorStrategy(timeslotReferenceHydrator),
                virtualMonitorReference : new dsign.hydrator.strategy.HydratorStrategy(
                    new dsign.hydrator.PropertyHydrator(new VirtualMonitorReference())),
                enableAudio : new dsign.hydrator.strategy.HybridStrategy(
                    dsign.hydrator.strategy.HybridStrategy.BOOLEAN_TYPE,
                    dsign.hydrator.strategy.HybridStrategy.NUMBER_TYPE
                )
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('status')
            .enableExtractProperty('context')
            .enableExtractProperty('rotation')
            .enableExtractProperty('enableAudio')
            .enableExtractProperty('virtualMonitorReference')
            .enableExtractProperty('currentIndex')
            .enableExtractProperty('binds')
            .enableExtractProperty('timeslots');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('context')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('virtualMonitorReference')
            .enableHydrateProperty('currentIndex')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('timeslots');

        this.getServiceManager().get('HydratorPluginManager').set(
            'playlistHydrator',
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
                            "name": PlaylistConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "status"
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
                                    PlaylistConfig.NAME_COLLECTION
                                ),
                                this.getServiceManager().get('HydratorPluginManager').get('playlistHydrator')
                            );

                            this.getServiceManager().get('StoragePluginManager').set(
                                PlaylistConfig.NAME_SERVICE,
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
    _loadPlaylistSender() {
        this.getServiceManager().get('SenderPluginManager').set('playlistSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadPlaylistService() {
        this.getServiceManager().get('StoragePluginManager').eventManager.on(
            dsign.serviceManager.ServiceManager.LOAD_SERVICE,
            (evt) => {
                if (evt.data.name === PlaylistConfig.NAME_SERVICE) {
                    let playlistService =  new PlaylistService(
                        this.getServiceManager().get('StoragePluginManager').get(TimeslotConfig.NAME_SERVICE),
                        this.getServiceManager().get('SenderPluginManager').get('playlistSender'),
                        this.getServiceManager().get('Timer'),
                        this.getServiceManager().get('TimeslotDataInjectorService'),
                        this.getServiceManager().get('StoragePluginManager').get(PlaylistConfig.NAME_SERVICE)
                    );
                    this.getServiceManager().set('PlaylistService', playlistService);
                }

            }
        )
    }
}

module.exports = PlaylistConfig;