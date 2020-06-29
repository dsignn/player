import {config} from './config';
import {ContainerAggregate, ContainerAware} from "@dsign/library/src/container/index";
import {Store} from "@dsign/library/src/storage/adapter/dexie/Store";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {
    HybridStrategy,
    HydratorStrategy,
    MongoIdStrategy,
    NumberStrategy
} from "@dsign/library/src/hydrator/strategy/value/index";
import {Time} from "@dsign/library/src/date";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {AbstractInjector} from "./src/injector/AbstractInjector";
import {Test1} from "./src/injector/Test1";
import {Test2} from "./src/injector/Test2";
import {MongoTimeslotAdapter} from "./src/storage/adapter/mongo/MongoTimeslotAdapter";
import {DexieTimeslotAdapter} from "./src/storage/adapter/dexie/DexieTimeslotAdapter";
import {Repository as ResourceRepository} from "./../resource/repository";
import {Repository as TimeslotRepository} from "./../timeslot/repository";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

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
            .set(Repository.TIMELINE_ENTITY_SERVICE, new TimelineEntity());
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.TIMELINE_HYDRATOR_SERVICE,
            Repository.getTimelineHydrator(
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

            const adapter = new MongoTimelineAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.TIMELINE_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
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
                MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }

    /**
     *
     */
    initTimelineService() {
        this.getContainer().set(
            Repository.TIMELINE_SERVICE,
            new TimelineService(
                this.getContainer().get('StorageContainerAggregate').get(TimeslotRepository.STORAGE_SERVICE),
                this.getContainer().get('SenderContainerAggregate').get(TimeslotRepository.TIMESLOT_SENDER_SERVICE),
                this.getContainer().get('Timer'),
                this.getContainer().get(TimeslotRepository.TIMESLOT_INJECTOR_DATA_SERVICE),
                this.getContainer().get('StorageContainerAggregate').get(Repository.STORAGE_SERVICE)
            )
        );
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getTimelineHydrator(container) {

        let hydrator =  new PropertyHydrator(
            container.get(Repository.TIMELINE_ENTITY_SERVICE),
            {
                id: new MongoIdStrategy(),
                _id: new MongoIdStrategy(),
                time: new HydratorStrategy(new PropertyHydrator(new Time())),
                timer: new HydratorStrategy(new PropertyHydrator(new Time())),
                timelineItems: new HydratorStrategy(Repository.getTimelineItemHydrator(container)),
                binds: new HydratorStrategy(Repository.getTimelineReferenceHydrator(container))
            },
            {
                id: new MapProprertyStrategy('id', '_id'),
                _id: new MapProprertyStrategy('id', '_id')
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

        let timeHydrator = new PropertyHydrator(new Time());
        timeHydrator.addValueStrategy('seconds', new NumberStrategy())
            .addValueStrategy('minutes', new NumberStrategy())
            .addValueStrategy('hours', new NumberStrategy());

        let hydrator = new PropertyHydrator(
            new TimelineItem(),
            {
                time: new HydratorStrategy(timeHydrator),
                timeslotReferences:  new HydratorStrategy(TimeslotRepository.getTimeslotReferenceHydrator(container))
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