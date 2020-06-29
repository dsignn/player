import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/PropertyHydrator";
import {MongoIdStrategy} from "@dsign/library/src/hydrator/strategy/value/index";
import {MapProprertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/index";
import {MongoMediaDeviceAdapter} from "./src/storage/adapter/mongo/MongoMediaDeviceAdapter";
import {MediaDeviceEntity} from "./src/entity/MediaDeviceEntity";
import {MediaDeviceDataInjector} from "./src/injector/MediaDeviceDataInjector";
import {Repository as TimeslotRepository} from "../timeslot/repository";
import {config} from "./config";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {
    /**
     * @return {string}
     * @constructor
     */
    static get MEDIA_DEVICE_ENTITY_SERVICE() { return 'MediaDeviceEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MEDIA_DEVICE_HYDRATOR_SERVICE() { return 'MediaDeviceEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'MediaDeviceStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'media-device'; };


    /**
     * @return {string}
     * @constructor
     */
    static get MEDIA_DEVICE_CHROME_API_HYDRATOR_SERVICE() { return 'MediaDeviceEntityChromeApiHydrator'; };

    init() {
        this.loadConfig();
        this.initAcl();
        this.initEntity();
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
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.MEDIA_DEVICE_ENTITY_SERVICE, new MediaDeviceEntity());
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            // TODO add method on service
            aclService.addResource('media-device');
            aclService.allow('guest', 'media-device');
        }
    }

    /**
     * @private
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.MEDIA_DEVICE_HYDRATOR_SERVICE,
            Repository.getMediaDeviceHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.MEDIA_DEVICE_CHROME_API_HYDRATOR_SERVICE,
            Repository.getMediaDeviceChromeApiHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoMediaDeviceAdapter(this.getContainer().get('MongoDb'), Repository.COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.MEDIA_DEVICE_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.STORAGE_SERVICE,
                storage
            );

            this.getContainer().get(TimeslotRepository.TIMESLOT_INJECTOR_DATA_SERVICE)
                .set(
                    'MediaDeviceDataInjector',
                    new MediaDeviceDataInjector(storage)
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
     * @param {ContainerInterface}   container
     * @return {PropertyHydrator}
     */
    static getMediaDeviceHydrator(container) {

        let hydrator = new PropertyHydrator(container.get('MediaDeviceEntity'));

        hydrator.addPropertyStrategy('id', new MapProprertyStrategy('id', '_id'))
            .addPropertyStrategy('_id', new MapProprertyStrategy('id', '_id'));

        hydrator.addValueStrategy('id', new MongoIdStrategy())
            .addValueStrategy('_id', new MongoIdStrategy());

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('groupId')
            .enableExtractProperty('deviceName')
            .enableExtractProperty('deviceId')
            .enableExtractProperty('type');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('groupId')
            .enableHydrateProperty('deviceName')
            .enableHydrateProperty('deviceId')
            .enableHydrateProperty('type');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getMediaDeviceChromeApiHydrator(container) {

        let hydrator = Repository.getMediaDeviceHydrator(container);

        hydrator.addPropertyStrategy('kind', new  MapProprertyStrategy('type', 'type'))
            .addPropertyStrategy('label', new MapProprertyStrategy('deviceName', 'label'))
            .addPropertyStrategy('deviceName', new MapProprertyStrategy('deviceName', 'label'));

        hydrator.enableExtractProperty('label')
            .enableExtractProperty('kind');

        hydrator.enableHydrateProperty('label')
            .enableHydrateProperty('kind');

        return hydrator;
    }
}
