/**
 *
 */
class PlaylistConfig extends PluginConfig {

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

        let hydrator = new PropertyHydrator(
            new Playlist(),
            {
                'timeslots' : new HydratorStrategy(this.serviceManager.get('HydratorPluginManager').get('timeslotHydrator'))
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

        this.serviceManager.get('HydratorPluginManager').set(
            'playlistHydrator',
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
                            "name": PlaylistConfig.NAME_COLLECTION,
                            "index": [
                                "++id", "name", "status"
                            ]
                        }
                    );


                    /**
                     *
                     */
                    serviceManager.get('DexieManager').onReady(
                        function (evt) {

                            let storage = new Storage(
                                new DexieCollection(
                                    serviceManager.get('DexieManager'),
                                    PlaylistConfig.NAME_COLLECTION
                                ),
                                serviceManager.get('HydratorPluginManager').get('playlistHydrator')
                            );


                            serviceManager.get('StoragePluginManager').set(
                                PlaylistConfig.NAME_SERVICE,
                                storage
                            );
                        }.bind(this)
                    );
                }
            }
        );
    }

    /**
     * @private
     */
    _loadPlaylistSender() {
        this.serviceManager.get('SenderPluginManager')
            .set('playlistSender', require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    _loadPlaylistService() {
        this.serviceManager.get('StoragePluginManager').eventManager.on(
            ServiceManager.LOAD_SERVICE,
            function (evt) {
                if (evt.data.name === PlaylistConfig.NAME_SERVICE) {
                    let playlistService =  new PlaylistService(
                        serviceManager.get('SenderPluginManager').get('playlistSender'),
                        serviceManager.get('StoragePluginManager').get(PlaylistConfig.NAME_SERVICE),
                        serviceManager.get('Timer')
                    );
                    serviceManager.set('PlaylistService', playlistService);
                }

            }
        )
    }
}

module.exports = PlaylistConfig;