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
     * @return {string}
     * @constructor
     */
    static get PLAYLIST_SERVICE() { return 'PlaylistService'; };


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

            this.initPlaylistService();
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
     *
     */
    initPlaylistService() {
        this.getContainer()
            .set(
                PlaylistConfig.PLAYLIST_SERVICE,
                new PlaylistService(
                    this.getContainer().get('StorageContainerAggregate').get(TimeslotConfig.STORAGE_SERVICE),
                    this.getContainer().get('SenderContainerAggregate').get(TimeslotConfig.TIMESLOT_SENDER_SERVICE),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(TimeslotConfig.TIMESLOT_INJECTOR_DATA_SERVICE),
                    this.getContainer().get('StorageContainerAggregate').get(PlaylistConfig.STORAGE_SERVICE)
                )
            );
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getPlaylistEntityHydrator(container) {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(PlaylistConfig.PLAYLIST_ENTITY_SERVICE)
        );

        let timeslotStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        timeslotStrategy.setHydrator(PlaylistConfig.getTimeslotReferenceHydrator(container));

        let playlistStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        playlistStrategy.setHydrator(PlaylistConfig.getPlaylistReferenceHydrator(container));

        hydrator.addValueStrategy('timeslots', timeslotStrategy)
            .addValueStrategy('binds', playlistStrategy)
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
            .enableExtractProperty('currentIndex')
            .enableExtractProperty('binds')
            .enableExtractProperty('timeslots');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('context')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('currentIndex')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('timeslots');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getTimeslotReferenceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get('EntityNestedReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('parentId')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('monitorContainerReference')
            .enableHydrateProperty('name')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('currentTime');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('parentId')
            .enableExtractProperty('collection')
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('name')
            .enableExtractProperty('duration')
            .enableExtractProperty('currentTime');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getPlaylistReferenceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get('EntityReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name');

        return hydrator;
    }
}

module.exports = PlaylistConfig;
