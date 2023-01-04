import {config} from './config';
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {HydratorStrategy, MongoIdStrategy, NumberStrategy} from "@dsign/library/src/hydrator/strategy/value/index";
import {TimerEntity} from "./src/entity/TimerEntity";
import {MongoTimerAdapter} from "./src/storage/adapter/mongo/MongoTimerAdapter";
import {TimerDataInjector} from "./src/injector/TimerDataInjector";
import {MapPropertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy";
import {Time} from "@dsign/library/src/date/Time";
import {Repository as TimeslotRepository} from "../timeslot/repository";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

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
        this.loadConfig();
        this.initAcl();
        this.initEntity();
        this.initTimerSender();
        this.initHydrator();
        this.initMongoStorage();
    }

    /**
     * Merge config
     */
    loadConfig() {
        this.container.set(
            'config',
            this.getContainer().get('merge').merge(config, this.getContainer().get('config'))
        );
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.addResource('timer');
            aclService.allow('guest', 'timer');
        }
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.TIMER_ENTITY_SERVICE, new TimerEntity());
    }

    /**
     * @private
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.TIMER_HYDRATOR_SERVICE,
            Repository.getTimerHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }

    /**
     *
     */
    initTimerSender() {
        this.getContainer()
            .get('SenderContainerAggregate')
            .set(Repository.TIMER_SENDER_SERVICE, require('electron').ipcRenderer);
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoTimerAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.TIMER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
                storage
            );

            this._loadTimerService();

            this.getContainer().get( 
                    this.getContainer().get('ModuleConfig')['timeslot']['timeslot']['injectorDataTimeslotAggregate']
                ).set(
                    'TimerDataInjector',
                    new TimerDataInjector(storage, this.getContainer().get(Repository.TIMER_SERVICE))
                );
        };

        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(
                MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getTimerHydrator(container) {
        let hydrator = new PropertyHydrator(
            container.get(Repository.TIMER_ENTITY_SERVICE),
            {
                startAt: new HydratorStrategy(Repository.getTimeHydrator()),
                endAt: new HydratorStrategy(Repository.getTimeHydrator()),
                timer: new HydratorStrategy(Repository.getTimeHydrator()),
                autoStart: new NumberStrategy()
            }
        );

        hydrator.addPropertyStrategy('id', new MapPropertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapPropertyStrategy('id', '_id'));

        hydrator.addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy());

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
        let hydrator = new PropertyHydrator(
            new  Time(),
            {
                hours: new NumberStrategy(),
                minutes: new NumberStrategy(),
                seconds: new NumberStrategy()
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

        this.getContainer().set(Repository.TIMER_SERVICE, new TimerService(
            this.getContainer().get('StorageContainerAggregate').get(Repository.STORAGE_SERVICE),
            this.getContainer().get('SenderContainerAggregate').get(Repository.TIMER_SENDER_SERVICE),
            this.getContainer().get('Timer'),
            )
        );
    }
}