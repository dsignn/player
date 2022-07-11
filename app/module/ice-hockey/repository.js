import { ContainerAware } from "@dsign/library/src/container/index";
import { config } from './config';
import { IceHockeyEntity } from "./src/entity/IceHockeyEntity";
import { MongoDb } from "@dsign/library/src/storage/adapter/mongo/MongoDb";
import { MongoIceHockeyAdapter } from "./src/storage/adapter/mongo/MongoIceHockeyAdapter";
import { PropertyHydrator } from "@dsign/library/src/hydrator/index";
import { Storage } from "@dsign/library/src/storage/Storage";

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     * Init
     */
    init() {

        this.initConfig();
        this.initEntity();
        this.initHydrator()
        this.initMongoMatchStorage();
        this.initAcl();
    }

    /**
     * Merge config
     */
     initConfig() {
        this.getContainer().set(
            'Config',
            this.getContainer().get('merge').merge(this.getContainer().get('Config'), config)
        );
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].entityService, 
                new IceHockeyEntity()
            );    
    }


    /**
     *
     */
     initMongoMatchStorage() {

        var connectorServiceName = this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage.adapter.mongo['connection-service'];

        let loadStorage = () => {

            const adapter = new MongoIceHockeyAdapter(
                this.getContainer().get(connectorServiceName),
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage.adapter.mongo.collection
            );

            const storage = new Storage(adapter);
          
            storage.setHydrator(
                this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service'])
            );

            this.getContainer().get('StorageContainerAggregate').set(
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].storage['name-service'],
                storage
            );
        };

        if (!this.getContainer().get(connectorServiceName)) {
            return;
        }

        if (this.getContainer().get(connectorServiceName).isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get(connectorServiceName).getEventManager().on(
                MongoDb.READY_CONNECTION,
                loadStorage
            );
        }
    }

    /**
     *
     */
    initAcl() {
        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            let resource =  this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].acl.resource;
            // TODO add method on service
            aclService.addResource(resource);
            aclService.allow('guest', resource);
        }
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                this.getContainer().get('Config').modules['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service'],
                Repository.getIceHockeyMatchHydrator(this.getContainer())
            );
    }

    static getIceHockeyMatchHydrator(container) {
        
        let hydrator = new PropertyHydrator(
            container.get('EntityContainerAggregate').get(
                container.get('Config').modules['ice-hockey']['ice-hockey-match'].entityService
            )
        );

        return hydrator;
    }
}