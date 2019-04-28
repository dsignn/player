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

        /**
         * Resource strategy
         */
        let resourceStrategy = new (require("@p3e/library").hydrator.strategy.value.HydratorStrategy)();
        resourceStrategy.setHydrator(ResourceConfig.getResourceHydrator(container));

        /**
         * Monitor strategy
         */
        let monitorStrategy = new (require("@p3e/library").hydrator.strategy.value.HydratorStrategy)();
        monitorStrategy.setHydrator(TimeslotConfig.getContainerMonitorReferenceHydrator(container));


        /**
         * Timeslot bind strategy
         */
        let bindTimeslotStrategy = new (require("@p3e/library").hydrator.strategy.value.HydratorStrategy)();
        bindTimeslotStrategy.setHydrator(TimeslotConfig.getTimeslotReferenceHydrator(container));

        hydrator.addValueStrategy('resources', resourceStrategy)
            .addValueStrategy('monitorContainerReference', monitorStrategy)
            .addValueStrategy('binds', bindTimeslotStrategy)
            .addValueStrategy('enableAudio', new (require("@p3e/library").hydrator.strategy.value.HybridStrategy)(
                require("@p3e/library").hydrator.strategy.value.HybridStrategy.BOOLEAN_TYPE,
                require("@p3e/library").hydrator.strategy.value.HybridStrategy.NUMBER_TYPE
            ));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('status')
            .enableHydrateProperty('binds')
            .enableHydrateProperty('currentTime')
            .enableHydrateProperty('duration')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('context')
            .enableHydrateProperty('monitorContainerReference')
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
            .enableExtractProperty('monitorContainerReference')
            .enableExtractProperty('resources')
            .enableExtractProperty('dataReferences')
            .enableExtractProperty('tags')
            .enableExtractProperty('rotation')
            .enableExtractProperty('filters');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getContainerMonitorReferenceHydrator(container) {

        let hydrator = new (require("@p3e/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get('EntityNestedReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name')
            .enableHydrateProperty('parentId');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name')
            .enableExtractProperty('parentId');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getTimeslotReferenceHydrator(container) {

        let hydrator = new (require("@p3e/library").hydrator.PropertyHydrator)();
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


module.exports = TimeslotConfig;
