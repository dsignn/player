/**
 *
 */
class PlaylistConfig extends require("@dsign/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'playlist'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'PlaylistStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_ENTITY_SERVICE() { return 'PlaylistEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_ENTITY_SERVICE() { return 'PlaylistEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_HYDRATOR_SERVICE() { return 'PlaylistEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_HYDRATOR_SERVICE() { return 'PlaylistEntityHydrator'; };

    /**
     *
     */
    init() {

        this.initEntity();
        this.initHydrator();
        this.initStorage();
    }

    /**
     *
     */
    initStorage() {

        const dexieManager = this.getContainer().get('DexieManager');

        /**
         * Add schema
         */
        let store = new (require("@dsign/library").storage.adapter.dexie.Store)(
            PlaylistConfig.COLLECTION,
            ["++id", "name", "status"]

        );

        dexieManager.addStore(store);


        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {

            const adapter = new DexiePlaylistAdapter(dexieManager, PlaylistConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(PlaylistConfig.PLAYLIST_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                PlaylistConfig.STORAGE_SERVICE,
                storage
            );
        });
    }


    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(PlaylistConfig.PLAYLIST_ENTITY_SERVICE, new PlaylistEntity());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                PlaylistConfig.PLAYLIST_HYDRATOR_SERVICE,
                PlaylistConfig.getPlaylistEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getPlaylistEntityHydrator(container) {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(PlaylistConfig.PLAYLIST_ENTITY_SERVICE)
        );

        hydrator
            .addValueStrategy('enableAudio', new (require("@dsign/library").hydrator.strategy.value.HybridStrategy)(
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.BOOLEAN_TYPE,
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.NUMBER_TYPE
            ));

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


        return hydrator;
    }
}


module.exports = PlaylistConfig;
