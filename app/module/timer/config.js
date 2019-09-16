
/**
 * Config file to load services
 */
class TimerConfig extends require("@dsign/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get TIMER_SENDER_SERVICE() { return 'TimerSender'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMER_ENTITY_SERVICE() { return 'TimerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'timer'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'TimerStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMER_SERVICE() { return 'TimerService'; };

    /**
     * @return {string}
     * @constructor
     */
    static get TIMER_HYDRATOR_SERVICE() { return 'TimerEntityHydrator'; };

    init() {

        this.initAcl();
        this.initEntity();
        this.initTimerSender();
        this.initHydrator();
        this.initMongoStorage();
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('timer');
            aclService.adapter.acl.allow('guest', 'timer');
        }
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(TimerConfig.TIMER_ENTITY_SERVICE, new TimerEntity());
    }

    /**
     * @private
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            TimerConfig.TIMER_HYDRATOR_SERVICE,
            TimerConfig.getTimerHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }

    /**
     *
     */
    initTimerSender() {
        this.getContainer()
            .get('SenderContainerAggregate')
            .set(TimerConfig.TIMER_SENDER_SERVICE, require('electron').ipcRenderer);
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimeslotAdapter(this.getContainer().get('MongoDb'), TimerConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(TimerConfig.TIMER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                TimerConfig.STORAGE_SERVICE,
                storage
            );

           this._loadTimerService();

            this.getContainer().get(TimeslotConfig.TIMESLOT_INJECTOR_DATA_SERVICE)
                .set(
                    'TimerDataInjector',
                    new TimerDataInjector(storage, this.getContainer().get(TimerConfig.TIMER_SERVICE))
                );
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
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getTimerHydrator(container) {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(TimerConfig.TIMER_ENTITY_SERVICE),
            {
                startAt: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(TimerConfig.getTimeHydrator()),
                endAt: new(require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(TimerConfig.getTimeHydrator()),
                timer: new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)(TimerConfig.getTimeHydrator()),
                autoStart: new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)()
            }
        );

        hydrator.addPropertyStrategy(
            'id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        ).addPropertyStrategy(
            '_id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        );

        hydrator.addValueStrategy('id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)())
            .addValueStrategy('_id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)());

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('startAt')
            .enableExtractProperty('endAt')
            .enableExtractProperty('type')
            .enableExtractProperty('timer')
            .enableExtractProperty('status')
            .enableExtractProperty('autoStart');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('startAt')
            .enableHydrateProperty('endAt')
            .enableHydrateProperty('type')
            .enableHydrateProperty('timer')
            .enableHydrateProperty('status')
            .enableHydrateProperty('autoStart');

        return hydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    static getTimeHydrator() {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            new  (require("@dsign/library").date.Time)(),
            {
                hours: new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)(),
                minutes: new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)(),
                seconds: new (require("@dsign/library").hydrator.strategy.value.NumberStrategy)()
            }
        );

        hydrator.enableExtractProperty('hours')
            .enableExtractProperty('minutes')
            .enableExtractProperty('seconds');

        hydrator.enableHydrateProperty('hours')
            .enableHydrateProperty('minutes')
            .enableHydrateProperty('seconds');

        return hydrator;
    }

    /**
     * @private
     */
    _loadTimerService() {

        this.getContainer().set(TimerConfig.TIMER_SERVICE, new TimerService(
            this.getContainer().get('StorageContainerAggregate').get(TimerConfig.STORAGE_SERVICE),
            this.getContainer().get('SenderContainerAggregate').get(TimerConfig.TIMER_SENDER_SERVICE),
            this.getContainer().get('Timer'),
            )
        );
    }
}
module.exports = TimerConfig;
