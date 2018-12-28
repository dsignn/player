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
     *
     * @return {AggregatePropertyHydrator}
     * @private
     */
    _loadHydrator() {

        let hydrator = new dsign.hydrator.PropertyHydrator(
            new Playlist(),
            {
                'timeslots' : new dsign.hydrator.strategy.HydratorStrategy(this.getServiceManager().get('HydratorPluginManager').get('timeslotHydrator'))
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('context')
            .enableExtractProperty('loop')
            .enableExtractProperty('currentIndex')
            .enableExtractProperty('status')
            .enableExtractProperty('binds')
            .enableExtractProperty('timeslots');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('context')
            .enableHydrateProperty('currentIndex')
            .enableHydrateProperty('loop')
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
                        this.getServiceManager().get('StoragePluginManager').get(PlaylistConfig.NAME_SERVICE),
                        this.getServiceManager().get('SenderPluginManager').get('playlistSender'),
                        this.getServiceManager().get('Timer'),
                        this.getServiceManager().get('TimeslotDataInjectorService')
                    );
                    this.getServiceManager().set('PlaylistService', playlistService);
                }

            }
        )
    }
}

module.exports = PlaylistConfig;