/**
 *
 */
class TimeslotConfig extends require("@dsign/library").container.ContainerAware {

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
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_SERVICE() { return 'TimeslotService'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_INJECTOR_DATA_SERVICE() { return 'InjectorDataTimeslotAggregate'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_SENDER_SERVICE() { return 'TimeslotSender'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMESLOT_RECEIVER_SERVICE() { return 'TimeslotReceiver'; };

    /**
     *
     */
    init() {

        this.initAcl();
        this.initInjectorDataTimeslotCotainerAggregate();
        this.initTimeslotSender();
        this.initTimeslotReceiver();
        this.initEntity();
        this.initHydrator();
        this.initMongoStorage();
    }

    /**
     *
     */
    initDexieStorage() {

        const dexieManager = this.getContainer().get('DexieManager');

        let store = new (require("@dsign/library").storage.adapter.dexie.Store)(
            TimeslotConfig.COLLECTION,
            ["++id", "name", "status", "duration", "monitorContainerReference.id", "[monitorContainerReference.parentId+name]", "[resources.id]","*tags", "rotation"]

        );

        dexieManager.addStore(store);

        dexieManager.on("ready", () => {

            const adapter = new DexieTimeslotAdapter(dexieManager, TimeslotConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(TimeslotConfig.TIMESLOT_HYDRATOR_SERVICE));


            this.getContainer().get('StorageContainerAggregate').set(
                TimeslotConfig.STORAGE_SERVICE,
                storage
            );

            this.initTimeslotService();
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimeslotAdapter(this.getContainer().get('MongoDb'), TimeslotConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(TimeslotConfig.TIMESLOT_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                TimeslotConfig.STORAGE_SERVICE,
                storage
            );

            this.initTimeslotService();
        };


        if (!this.getContainer().get('MongoDb')) {
            return;
        }


        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(
                require("@dsign/library").storage.adapter.mongo.MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }

    /**
     *
     */
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
     * @private
     */
    initTimeslotSender() {
        this.getContainer()
            .get('SenderContainerAggregate')
            .set(TimeslotConfig.TIMESLOT_SENDER_SERVICE, require('electron').ipcRenderer);
    }

    /**
     * @private
     */
    initTimeslotReceiver() {
        this.getContainer()
            .get('ReceiverContainerAggregate')
            .set(TimeslotConfig.TIMESLOT_RECEIVER_SERVICE, require('electron').ipcRenderer);
    }

    /**
     *
     */
    initInjectorDataTimeslotCotainerAggregate() {

        const entityContainerAggregate = new (require("@dsign/library").container.ContainerAggregate)();
        entityContainerAggregate.setPrototipeClass(AbstractInjector);
        entityContainerAggregate.setContainer(this.getContainer());

        entityContainerAggregate.set(
            'Test1',
            new Test1()
        );

        entityContainerAggregate.set(
            'Test2',
            new Test2()
        );

        this.getContainer().set(TimeslotConfig.TIMESLOT_INJECTOR_DATA_SERVICE, entityContainerAggregate);

    }

    /**
     *
     */
    initTimeslotService() {
        this.getContainer()
            .set(
                TimeslotConfig.TIMESLOT_SERVICE,
                new TimeslotService(
                    this.getContainer().get('StorageContainerAggregate').get(TimeslotConfig.STORAGE_SERVICE),
                    this.getContainer().get('SenderContainerAggregate').get(TimeslotConfig.TIMESLOT_SENDER_SERVICE),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(TimeslotConfig.TIMESLOT_INJECTOR_DATA_SERVICE)
                )
            );
    }

    /**
     * @param container
     */
    static getTimeslotHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get(TimeslotConfig.TIMESLOT_ENTITY_SERVICE));

        /**
         * Resource strategy
         */
        let resourceStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        resourceStrategy.setHydrator(ResourceConfig.getResourceHydrator(container));

        /**
         * Monitor strategy
         */
        let monitorStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        monitorStrategy.setHydrator(TimeslotConfig.getContainerMonitorReferenceHydrator(container));

        /**
         * Timeslot bind strategy
         */
        let bindTimeslotStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        bindTimeslotStrategy.setHydrator(TimeslotConfig.getTimeslotReferenceHydrator(container));

        /**
         * Timeslot bind strategy
         */
        let injectorDataStrategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        injectorDataStrategy.setHydrator(TimeslotConfig.getInjectorHydrator(container));

        hydrator.addPropertyStrategy(
            'id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        ).addPropertyStrategy(
            '_id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        );

        hydrator.addValueStrategy('resources', resourceStrategy)
            .addValueStrategy('id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)())
            .addValueStrategy('_id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)())
            .addValueStrategy('monitorContainerReference', monitorStrategy)
            .addValueStrategy('binds', bindTimeslotStrategy)
            .addValueStrategy('currentTime', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)())
            .addValueStrategy('duration', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)())
            .addValueStrategy('dataReferences', injectorDataStrategy)
            .addValueStrategy('enableAudio', new (require("@dsign/library").hydrator.strategy.value.HybridStrategy)(
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.BOOLEAN_TYPE,
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.NUMBER_TYPE
            ));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
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
            .enableHydrateProperty('_id')
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

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
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

    /**
     * @param container
     * @return {*}
     */
    static getInjectorHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(new Injector());

        hydrator.enableHydrateProperty('name')
            .enableHydrateProperty('data');


        hydrator.enableExtractProperty('name')
            .enableExtractProperty('data');

        return hydrator;
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('timeslot');
            aclService.adapter.acl.allow('guest', 'timeslot');
        }
    }
}

module.exports = TimeslotConfig;
