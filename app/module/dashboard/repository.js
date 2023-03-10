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
     */
    init() {
        this.initConfig();
        this.initAcl();
        this.initEntity();
        this.initHydrator();
        this.initStorage();
    }

    /**
     * Merge config
     */
    initConfig() {
        this.container.set(
            'ModuleConfig',
            this.getContainer().get('merge').merge(this.getContainer().get('ModuleConfig'), config)
        );
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].entityService,
                new WidgetEntity()
            );
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].hydrator['name-storage-service'],
                Repository.getWidgetEntityHydrator(this.getContainer())
            );
    }

    /**
     *
     */
    initStorage() {    

        const adapter = new LocalStorageAdapter(
            this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].storage.adapter.localStorage.namespace,
            this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].storage.adapter.localStorage.collection
        );

        adapter.setIdentifier('id');

        const storage = new Storage(adapter);
        storage.setHydrator(this.getContainer().get('HydratorContainerAggregate')
            .get(this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].hydrator['name-storage-service'])
        );

        storage.getEventManager().on(
            Storage.BEFORE_SAVE,
            (evt) => {
                let mongoIdGen = new MongoIdGenerator();
                evt.data.id = mongoIdGen.generateId();
            }
        );

        this.getContainer().get('StorageContainerAggregate').set(
            this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].storage['name-service'],
            storage
        );

    }

    /**
     * @param {ContainerAggregate} container
     */
    static getWidgetEntityHydrator(container) {

        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('ModuleConfig')['dashboard']['dashboard'].entityService
            )
        );

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
            let resource = this.getContainer().get('ModuleConfig')['dashboard']['dashboard'].acl.resource;


            // TODO add method on service
            aclService.addResource('dashboard');
            aclService.allow('guest', 'dashboard');
        }
    }
}
