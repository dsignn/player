/**
 * @class TimelineConfig
 */
class TimelineConfig extends require("@dsign/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get TIMELINE_ENTITY_SERVICE() { return 'TimelineEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMELINE_HYDRATOR_SERVICE() { return 'TimelineEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'timeline'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'TimelineStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMELINE_SERVICE() { return 'TimelineService'; };

    /**
     *
     */
    init() {

        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initMongoStorage();
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(TimelineConfig.TIMELINE_ENTITY_SERVICE, new TimelineEntity());
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            TimelineConfig.TIMELINE_HYDRATOR_SERVICE,
            TimelineConfig.getTimelineHydrator(
                this.getContainer().get('EntityContainerAggregate')
            )
        );

    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('timeline');
            aclService.adapter.acl.allow('guest', 'timeline');
        }
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimelineAdapter(this.getContainer().get('MongoDb'), TimelineConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(TimelineConfig.TIMELINE_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                TimelineConfig.STORAGE_SERVICE,
                storage
            );

            this.initTimelineService();
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
    initTimelineService() {
        this.getContainer().set(
            TimelineConfig.TIMELINE_SERVICE,
            new TimelineService(
                this.getContainer().get('StorageContainerAggregate').get(TimeslotConfig.STORAGE_SERVICE),
                this.getContainer().get('SenderContainerAggregate').get(TimeslotConfig.TIMESLOT_SENDER_SERVICE),
                this.getContainer().get('Timer'),
                this.getContainer().get(TimeslotConfig.TIMESLOT_INJECTOR_DATA_SERVICE),
                this.getContainer().get('StorageContainerAggregate').get(TimelineConfig.STORAGE_SERVICE)
            )
        );
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getTimelineHydrator(container) {

        let hydrator =  new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(TimelineConfig.TIMELINE_ENTITY_SERVICE),
            {
                id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                _id: new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)(),
                time: new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    new (require("@dsign/library").hydrator.PropertyHydrator)(new (require("@dsign/library").date.Time)())
                ),
                timer: new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    new (require("@dsign/library").hydrator.PropertyHydrator)(new (require("@dsign/library").date.Time)())
                ),
                timelineItems:  new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    TimelineConfig.getTimelineItemHydrator(container)
                ),
                binds:  new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    TimelineConfig.getTimelineReferenceHydrator(container)
                )
            },
            {
                id: new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id'),
                _id: new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
            }
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('time')
            .enableExtractProperty('timer')
            .enableExtractProperty('context')
            .enableExtractProperty('status')
            .enableExtractProperty('enableAudio')
            .enableExtractProperty('rotation')
            .enableExtractProperty('timelineItems')
            .enableExtractProperty('binds');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('time')
            .enableHydrateProperty('timer')
            .enableHydrateProperty('context')
            .enableHydrateProperty('status')
            .enableHydrateProperty('enableAudio')
            .enableHydrateProperty('rotation')
            .enableHydrateProperty('timelineItems')
            .enableHydrateProperty('binds');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getTimelineItemHydrator(container) {

        let timeHydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(new  (require("@dsign/library").date.Time)());
        timeHydrator.addValueStrategy('seconds', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)())
            .addValueStrategy('minutes', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)())
            .addValueStrategy('hours', new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)());

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            new TimelineItem(),
            {
                time: new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(timeHydrator),
                timeslotReferences:  new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(
                    TimeslotConfig.getTimeslotReferenceHydrator(container)
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
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getTimelineReferenceHydrator(container) {

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
module.exports = TimelineConfig;
