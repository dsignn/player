import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoDb} from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import {PropertyHydrator} from "@dsign/library/src/hydrator/index";
import {HydratorStrategy, MongoIdStrategy, NumberStrategy} from "@dsign/library/src/hydrator/strategy/value/index";
import {MapPropertyStrategy} from "@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy";
import {VideoPanelContainerEntity} from "./src/entity/VideoPanelContainerEntity";
import {VideoPanelResourceContainerEntity} from "./src/entity/VideoPanelResourceContainerEntity";
import {VideoPanelResource} from "./src/entity/embedded/VideoPanelResource";
import {MonitorMosaic} from "./src/entity/embedded/MonitorMosaic";
import {ResourceMosaic} from "./src/entity/embedded/ResourceMosaic";
import {VideoPanel} from "./src/entity/embedded/VideoPanel";
import {VideoPanelMosaic} from "./src/entity/embedded/VideoPanelMosaic";
import {MongoVideoPanelResourceAdapter} from "./src/storage/adapter/mongo/MongoVideoPanelResourceAdapter";
import {MongoVideoPanelAdapter} from "./src/storage/adapter/mongo/MongoVideoPanelAdapter";
import {Repository as MonitorRepository} from "../monitor/repository";
import {Repository as ResourceRepository} from "../resource/repository";
import {config} from './config';

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_CONTAINER_ENTITY_SERVICE() { return 'VideoPanelContainerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_MOSAIC_EMBEDDED_SERVICE() { return 'MonitorMosaic'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_MOSAIC_EMBEDDED_SERVICE() { return 'VideoPanelMosaic'; };

    /**
     * @return {string}
     * @constructor
     */
    static get RESOURCE_MOSAIC_EMBEDDED_SERVICE() { return 'ResourceMosaic'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_EMBEDDED_SERVICE() { return 'VideoPanel'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE() { return 'VideoPanelResource'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_CONTAINER_ENTITY_SERVICE() { return 'VideoPanelResourceContainerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE() { return 'VideoPanelContainerEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_TO_VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE() { return 'VideoPanelToVideoPanelResourceContainerHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_CONTAINER_HYDRATOR_SERVICE() { return 'VideoPanelResourceContainerHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_HYDRATOR_SERVICE() { return 'VideoPanelHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE() { return 'VideoPanelResourceEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  MONITOR_CONTAINER_MOSAIC_HYDRATOR_SERVICE() { return 'MonitorContainerMosaicHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_CONTAINER_MOSAIC_HYDRATOR_SERVICE() { return 'VideoPanelContainerMosaicHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  RESOURCE_MOSAIC_HYDRATOR_SERVICE() { return 'ResourceMosaicHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_COLLECTION() { return 'video-panel'; };

    /**
     * @return {string}
     * @constructor
     */
    static get  VIDEOPANEL_RESOURCE_COLLECTION() { return 'video-panel-resource'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_STORAGE_SERVICE() { return 'VideoPanelStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_SERVICE() { return 'VideoPanelService'; };

    /**
     * @return {string}
     * @constructor
     */
    static get VIDEOPANEL_RESOURCE_STORAGE_SERVICE() { return 'VideoPanelResourceStorage'; };

    init() {
        this.loadConfig();
        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initVideoPanelMongoStorage();
        this.initVideoPanelResourceMongoStorage();
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
            .set(Repository.VIDEOPANEL_CONTAINER_ENTITY_SERVICE, new VideoPanelContainerEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.VIDEOPANEL_RESOURCE_CONTAINER_ENTITY_SERVICE, new VideoPanelResourceContainerEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.VIDEOPANEL_EMBEDDED_SERVICE, new VideoPanel());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE, new VideoPanelResource());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.MONITOR_MOSAIC_EMBEDDED_SERVICE, new MonitorMosaic());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.VIDEOPANEL_MOSAIC_EMBEDDED_SERVICE, new VideoPanelMosaic());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Repository.RESOURCE_MOSAIC_EMBEDDED_SERVICE, new ResourceMosaic());
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.VIDEOPANEL_HYDRATOR_SERVICE,
            Repository.getVideoPanelHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.VIDEOPANEL_RESOURCE_CONTAINER_HYDRATOR_SERVICE,
            Repository.getVideoPanelResourceContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE,
            Repository.getVideoPanelContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.VIDEOPANEL_TO_VIDEOPANEL_RESOURCE_HYDRATOR_SERVICE,
            Repository.geVideoPanelToVideoPanelResourceHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.MONITOR_CONTAINER_MOSAIC_HYDRATOR_SERVICE,
            Repository.getMonitorContainerEntityForMosaicHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.VIDEOPANEL_CONTAINER_MOSAIC_HYDRATOR_SERVICE,
            Repository.getVideoPanelContainerForMosaicHydrator(this.getContainer().get('EntityContainerAggregate'))
        );

        this.getContainer().get('HydratorContainerAggregate').set(
            Repository.RESOURCE_MOSAIC_HYDRATOR_SERVICE,
            Repository.getResourceMosaicHydrator(this.getContainer().get('EntityContainerAggregate'))
        );
    }

    /**
     *
     */
    initVideoPanelMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoVideoPanelAdapter(this.getContainer().get('MongoDb'), Repository.VIDEOPANEL_COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.VIDEOPANEL_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.VIDEOPANEL_STORAGE_SERVICE,
                storage
            );

            this.initVideoPanelService();
        };

        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(MongoDb.READY_CONNECTION, loadStorage);
        }
    }

    /**
     *
     */
    initVideoPanelResourceMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoVideoPanelResourceAdapter(this.getContainer().get('MongoDb'), Repository.VIDEOPANEL_RESOURCE_COLLECTION);
            const storage = new Storage(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.VIDEOPANEL_RESOURCE_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Repository.VIDEOPANEL_RESOURCE_STORAGE_SERVICE,
                storage
            );
        };

        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(MongoDb.READY_CONNECTION, loadStorage);
        }
    }

    /**
     *
     */
    initVideoPanelService() {

        this.getContainer().set(
            Repository.VIDEOPANEL_SERVICE,
            new VideoPanelService(
                this.getContainer().get('StorageContainerAggregate').get(MonitorRepository.STORAGE_SERVICE),
                this.getContainer().get('StorageContainerAggregate').get(Repository.VIDEOPANEL_STORAGE_SERVICE),
                this.getContainer().get('StorageContainerAggregate').get(ResourceRepository.STORAGE_SERVICE),
                this.getContainer().get('HydratorContainerAggregate').get(Repository.MONITOR_CONTAINER_MOSAIC_HYDRATOR_SERVICE),
                this.getContainer().get('HydratorContainerAggregate').get(Repository.VIDEOPANEL_CONTAINER_MOSAIC_HYDRATOR_SERVICE),
                this.getContainer().get('HydratorContainerAggregate').get(Repository.RESOURCE_MOSAIC_HYDRATOR_SERVICE),
                this.getContainer().get('ResourceService')
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
            aclService.addResource('video-panel');
            aclService.allow('guest', 'video-panel');
        }
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelContainerEntityHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get(Repository.VIDEOPANEL_CONTAINER_ENTITY_SERVICE),
            {
                id: new MongoIdStrategy(),
                _id : new MongoIdStrategy(),
                videoPanel : new HydratorStrategy(Repository.getVideoPanelHydrator(container)),
            },
            {
                'id': new MapPropertyStrategy('id', '_id'),
                '_id': new MapPropertyStrategy('id', '_id')
            }
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('videoPanel');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('videoPanel');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelResourceContainerEntityHydrator(container) {
        let hydrator = new PropertyHydrator(
            container.get(Repository.VIDEOPANEL_RESOURCE_CONTAINER_ENTITY_SERVICE),
            {
                id: new MongoIdStrategy(),
                _id: new MongoIdStrategy(),
                resourceReference: new HydratorStrategy(ResourceRepository.getResourceReferenceHydrator(container)),
                videoPanelResource: new HydratorStrategy(Repository.getVideoPanelResourceHydrator(container))
            },
            {
                'id': new MapPropertyStrategy('id', '_id'),
                '_id': new MapPropertyStrategy('id', '_id')
            }
        );


        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('videoPanelResource')
            .enableHydrateProperty('resourceReference');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('videoPanelResource')
            .enableExtractProperty('resourceReference');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelResourceHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get(Repository.VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE),
            {
                id: new MongoIdStrategy(),
                _id : new MongoIdStrategy(),
                resourceReference: new HydratorStrategy(ResourceRepository.getResourceHydrator(container)),
                videoPanelReference: new HydratorStrategy(Repository.geVideoPanelContainerReferenceHydrator(container))
            },
            {
                'id': new MapPropertyStrategy('id', '_id'),
                '_id': new MapPropertyStrategy('id', '_id'),

            }
        );

        hydrator.addValueStrategy(
            'videoPanelResources',
            new HydratorStrategy(hydrator)
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('resources')
            .enableHydrateProperty('videoPanelReference')
            .enableHydrateProperty('videoPanelResources');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('resources')
            .enableExtractProperty('videoPanelReference')
            .enableExtractProperty('videoPanelResources');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {PropertyHydrator}
     */
    static getVideoPanelHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get(Repository.VIDEOPANEL_EMBEDDED_SERVICE),
            {
                id: new MongoIdStrategy(),
                _id : new MongoIdStrategy(),
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                monitorContainerReference: new HydratorStrategy(MonitorRepository.getMonitorContainerReferenceHydrator(container))
            },
            {
                'id': new MapPropertyStrategy('id', '_id'),
                '_id': new MapPropertyStrategy('id', '_id')
            }
        );

        hydrator.addValueStrategy(
            'videoPanels',
            new HydratorStrategy(hydrator)
        );

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('width')
            .enableHydrateProperty('height')
            .enableHydrateProperty('videoPanels')
            .enableHydrateProperty('monitorContainerReference');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('width')
            .enableExtractProperty('height')
            .enableExtractProperty('videoPanels')
            .enableExtractProperty('monitorContainerReference');


        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {HydratorInterface}
     */
    static geVideoPanelContainerReferenceHydrator(container) {

        let hydrator = new PropertyHydrator();
        hydrator.setTemplateObjectHydration(container.get('EntityNestedReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name')
            .enableHydrateProperty('parentId')
            .enableHydrateProperty('parentName');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name')
            .enableExtractProperty('parentId')
            .enableExtractProperty('parentName');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @return {HydratorInterface}
     */
    static geVideoPanelToVideoPanelResourceHydrator(container) {

        let hydrator = new VideoPanelToVideoPanelResourceHydrator();
        hydrator.setTemplateObjectHydration(container.get(Repository.VIDEOPANEL_RESOURCE_EMBEDDED_SERVICE));

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getMonitorContainerEntityForMosaicHydrator(container) {
        let hydrator = MonitorRepository.getMonitorContainerEntityHydrator(container);

        hydrator.addValueStrategy(
            'monitors',
            new HydratorStrategy(Repository.getMonitorMosaicHydrator(container))
        );

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getMonitorMosaicHydrator(container) {
        let hydrator = MonitorRepository.getMonitorEntityHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(Repository.MONITOR_MOSAIC_EMBEDDED_SERVICE));

        hydrator.addValueStrategy('monitors', new HydratorStrategy(hydrator))
            .addValueStrategy('progressOffsetX', new NumberStrategy())
            .addValueStrategy('progressOffsetY', new NumberStrategy());

        hydrator.enableHydrateProperty('progressOffsetX')
            .enableHydrateProperty('progressOffsetY');

        hydrator.enableExtractProperty('progressOffsetX')
            .enableExtractProperty('progressOffsetY');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getVideoPanelContainerForMosaicHydrator(container) {

        let hydrator = Repository.getVideoPanelContainerEntityHydrator(container);

        hydrator.addValueStrategy(
            'videoPanel',
            new HydratorStrategy(Repository.getVideoPanelMosaicHydrator(container))
        );

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getVideoPanelMosaicHydrator(container) {

        let hydrator = Repository.getVideoPanelHydrator(container);
        hydrator.setTemplateObjectHydration(container.get(Repository.VIDEOPANEL_MOSAIC_EMBEDDED_SERVICE));

        hydrator.addValueStrategy('videoPanels', new HydratorStrategy(hydrator))
            .enableHydrateProperty('computedWidth')
            .enableExtractProperty('computedWidth');

        return hydrator;
    }

    /**
     * @param {ContainerInterface} container
     * @returns {HydratorInterface}
     */
    static getResourceMosaicHydrator(container) {

        let hydrator = new PropertyHydrator(container.get(Repository.RESOURCE_MOSAIC_EMBEDDED_SERVICE),);

        let pathHydratorStrategy = new HydratorStrategy();
        pathHydratorStrategy.setHydrator(ResourceRepository.getPathHydrator(container));

        hydrator.addValueStrategy('path', pathHydratorStrategy);


        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('size')
            .enableHydrateProperty('type')
            .enableHydrateProperty('path')
            .enableHydrateProperty('tags')
            .enableHydrateProperty('lastModified')
            .enableHydrateProperty('dimension')
            .enableHydrateProperty('computedWidth');

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('size')
            .enableExtractProperty('type')
            .enableExtractProperty('path')
            .enableExtractProperty('tags')
            .enableExtractProperty('lastModified')
            .enableExtractProperty('dimension')
            .enableExtractProperty('computedWidth');

        return hydrator;
    }
}