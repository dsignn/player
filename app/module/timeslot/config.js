/**
 *
 */
class TimeslotConfig extends require("@p3e/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'timeslot'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'TimeslotStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_ENTITY_SERVICE() { return 'TimeslotEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_HYDRATOR_SERVICE() { return 'TimeslotEntityHydrator'; };

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


        let store = new (require("@p3e/library").storage.adapter.dexie.Store)(
            TimeslotConfig.COLLECTION,
            ["++id", "name", "status", "duration", "virtualMonitorReference.monitorId", "[virtualMonitorReference.monitorId+name]", "*tags", "rotation"]

        );

        dexieManager.addStore(store);



        dexieManager.on("ready", () => {

            const adapter = new DexieTimeslotAdapter(dexieManager, TimeslotConfig.COLLECTION);
            const storage = new (require("@p3e/library").storage.Storage)(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(TimeslotConfig.TIMESLOT_HYDRATOR_SERVICE));


            this.getContainer().get('StorageContainerAggregate').set(
                TimeslotConfig.STORAGE_SERVICE,
                storage
            );
        });
    }


    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(TimeslotConfig.TIMESLOT_ENTITY_SERVICE, new TimeslotEntity());

    }

    /**
     *
     */
    initHydrator() {

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                TimeslotConfig.TIMESLOT_HYDRATOR_SERVICE,
                TimeslotConfig.getTimeslotHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     * @param container
     */
    static getTimeslotHydrator(container) {

        let hydrator = new (require("@p3e/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get(TimeslotConfig.TIMESLOT_ENTITY_SERVICE));

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
}


module.exports = TimeslotConfig;
