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
