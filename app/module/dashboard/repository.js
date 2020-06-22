/**
 * Monitor repository
 */
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {LocalStorageAdapter} from "@dsign/library/src/storage/adapter/local-storage/LocalStorageAdapter";
import {Storage} from "@dsign/library/src/storage/Storage";
import {MongoIdGenerator} from "@dsign/library/src/storage/util/MongoIdGenerator";
import {PropertyHydrator} from "@dsign/library/src/hydrator/PropertyHydrator";
import {PathNode} from "@dsign/library/src/path/PathNode";

import {config} from './config';

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_COLLECTION() { return 'widget'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_STORAGE_SERVICE() { return 'WidgetStorage'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_ENTITY_SERVICE() { return 'WidgetEntity'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_HYDRATOR_SERVICE() { return 'DashboardEntityHydrator'; };

    /**
     *
     */
    init() {
        this.loadConfig();
        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initStorage();
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
            .set(Repository.WIDGET_ENTITY_SERVICE, new WidgetEntity());
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Repository.WIDGET_HYDRATOR_SERVICE,
                Repository.getWidgetEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }

    /**
     *
     */
    initStorage() {

        const adapter = new LocalStorageAdapter(
            this.getContainer().get('Config').storage.adapter.localStorage.namespace,
            Repository.WIDGET_COLLECTION
        );

        const storage = new Storage(adapter);
        storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Repository.WIDGET_HYDRATOR_SERVICE));

        storage.getEventManager().on(
            Storage.BEFORE_SAVE,
            (evt) => {
                let mongoIdGen = new MongoIdGenerator();
                evt.data.id = mongoIdGen.generateId();
            }
        );

        this.getContainer().get('StorageContainerAggregate').set(
            Repository.WIDGET_STORAGE_SERVICE,
            storage
        );

    }

    /**
     * @param {ContainerAggregate} container
     */
    static getWidgetEntityHydrator(container) {

        let hydrator = new PropertyHydrator(container.get(Repository.WIDGET_ENTITY_SERVICE));

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('col')
            .enableExtractProperty('row')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('wc')
            .enableExtractProperty('data');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('col')
            .enableHydrateProperty('row')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('wc')
            .enableHydrateProperty('data');

        return hydrator;
    }

    /**
     *
     * @param container
     * @return {PropertyHydrator}
     */
    static getPathHydrator(container) {

        let hydrator = new PropertyHydrator(new PathNode());

        hydrator.enableHydrateProperty('directory')
            .enableHydrateProperty('nameFile')
            .enableHydrateProperty('extension');

        hydrator.enableExtractProperty('directory')
            .enableExtractProperty('nameFile')
            .enableExtractProperty('extension');

        return hydrator;
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.addResource('dashboard');
            aclService.allow('guest', 'dashboard');
        }
    }
}
