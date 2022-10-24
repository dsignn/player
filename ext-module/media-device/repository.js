export async function Repository() {
    
    const { ContainerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/container/ContainerAware.js`));
    const { HydratorStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/value/HydratorStrategy.js`));
    const { MongoDb } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/mongo/MongoDb.js`));
    const { MapPropertyStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy.js`));
    const { MongoIdStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/value/MongoIdStrategy.js`));
    const { PropertyHydrator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/PropertyHydrator.js`));
    const { Store } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/Store.js`));
    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));

    const { MongoMediaDeviceAdapter } = await import('./src/storage/adapter/mongo/MongoMediaDeviceAdapter.js');
    const { MediaDeviceEntity } = await import('./src/entity/MediaDeviceEntity.js');
    const { MediaDeviceDataInjector } = await import('./src/injector/MediaDeviceDataInjector.js');
     
    let Repository = await import(`${container.get('Application').getBasePath()}module/timeslot/repository.js`);
    const TimeslotRepository = Repository.Repository;
  
    const { config } = await import('./config.js');

    /**
     * @class Repository
     */
    return class Repository extends ContainerAware {

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


        init() {

            this.initConfig();
            this.initAcl();
            this.initEntity();
            this.initHydrator();
            this.initDexieStorage();
        }

        /**
         * Merge config
         */
         initConfig() {
            this.container.set(
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
                    this.getContainer().get('Config').modules['media-device']['media-device'].entityService,
                    new MediaDeviceEntity());
        }

        /**
         *
         */
        initAcl() {

            if (this.getContainer().has('Acl')) {

                let aclService = this.getContainer().get('Acl');
                let resource = this.getContainer().get('Config').modules['media-device']['media-device'].acl.resource;

                aclService.addResource(resource);
                aclService.allow('guest', resource);
            }
        }

        /**
         * @private
         */
        initHydrator() {

            this.getContainer().get('HydratorContainerAggregate').set(
                this.getContainer().get('Config').modules['media-device']['media-device'].hydrator['name-storage-service'],
                Repository.getMediaDeviceHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this.getContainer().get('Config').modules['media-device']['media-device'].hydrator['chrome-api-storage-service'],
                Repository.getMediaDeviceChromeApiHydrator(this.getContainer())
            );
        }

        /**
         * 
         */
        initDexieStorage() {
    
            var connectorServiceName = this.getContainer().get('Config').modules['media-device']['media-device'].storage.adapter.dexie['connection-service'];
            var collection =    this.getContainer().get('Config').modules['media-device']['media-device'].storage.adapter.dexie.collection;
            const dexieManager = this.getContainer().get(connectorServiceName);
    
            let store = new Store(
                collection,
                [
                    "++id", 
                    "name"
                ]
            );
    
            dexieManager.addStore(store);

            /**
             * create schema
             */
            var generateSchema = () => {
                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('Config').modules['media-device']['media-device'].hydrator['name-storage-service']);
                hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));
    
                const adapter = new DexieTimeslotAdapter(dexieManager, collection);
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);
    
                this.getContainer().get('StorageContainerAggregate').set(
                    this.getContainer().get('Config').modules['media-device']['media-device'].storage['name-service'],
                    storage
                );

                this.getContainer().get(TimeslotRepository.TIMESLOT_INJECTOR_DATA_SERVICE)
                    .set(
                        'MediaDeviceDataInjector',
                        new MediaDeviceDataInjector(storage)
                    );
            }

            if(dexieManager.isOpen()) {
                let version = dexieManager.upgradeSchema();
                this.getContainer().get('Config').storage.adapter.dexie.version = version._cfg.version;
                this.getContainer().get('StorageContainerAggregate')
                    .get('ConfigStorage')
                    .update(this.getContainer().get('Config'))
                    .then((data) => {
                        this.getContainer().get('SenderContainerAggregate')
                            .get('Ipc')
                            .send('proxy', {event:'relaunch', data: {}}
                        );
                    });
            } else {
                dexieManager.on("ready", (data) => {
                    generateSchema();
                });
            }
        }

        /**
         *
         */
        initMongoStorage() {

            var connectorServiceName = this.getContainer().get('Config').modules['media-device']['media-device'].storage.adapter.mongo['connection-service'];

            let loadStorage = () => {

                const adapter = new MongoMediaDeviceAdapter(
                    this.getContainer().get(connectorServiceName),
                    this.getContainer().get('Config').modules['media-device']['media-device'].storage.adapter.mongo.collection
                );

                const storage = new Storage(adapter);

                storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(
                    this.getContainer().get('Config').modules['media-device']['media-device'].hydrator['name-storage-service'],
         
                ));

                this.getContainer().get('StorageContainerAggregate').set(
                    this.getContainer().get('Config').modules['media-device']['media-device'].storage['name-service'],
                    storage
                );

                this.getContainer().get(TimeslotRepository.TIMESLOT_INJECTOR_DATA_SERVICE)
                    .set(
                        'MediaDeviceDataInjector',
                        new MediaDeviceDataInjector(storage)
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
         * @param {ContainerInterface}   container
         * @return {PropertyHydrator}
         */
        static getMediaDeviceHydrator(container) {

            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('Config').modules['media-device']['media-device'].entityService
                )
            );

            hydrator
                //.addPropertyStrategy('id', new MapPropertyStrategy('id', '_id'))
                .addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

                /*
            hydrator.addValueStrategy('id', new MongoIdStrategy())
                .addValueStrategy('_id', new MongoIdStrategy());
                */

            hydrator
            //  .enableExtractProperty('id')
            //  .enableExtractProperty('_id')
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

            hydrator.addPropertyStrategy('kind', new  MapPropertyStrategy('type', 'type'))
                .addPropertyStrategy('label', new MapPropertyStrategy('deviceName', 'label'))
                .addPropertyStrategy('deviceName', new MapPropertyStrategy('deviceName', 'label'));

            hydrator.enableExtractProperty('label')
                .enableExtractProperty('kind');

            hydrator.enableHydrateProperty('label')
                .enableHydrateProperty('kind');

            return hydrator;
        }
    }

}
