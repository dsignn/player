export async function Repository() {
    const { ContainerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/container/ContainerAware.js`));
    const { MapPropertyStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy.js`));
    const { PropertyHydrator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/PropertyHydrator.js`));    
    const { MongoIdGenerator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/util/MongoIdGenerator.js`));   
    const { Store } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/Store.js`));
    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));
        
    const { DexieTcpSourceAdapter } = await import('./src/storage/adapter/dexie/DexieTcpSourceAdapter.js');
    const { TcpSourceEntity } = await import('./src/entity/TcpSourceEntity.js');
    const { TcpSourceDataInjector } = await import('./src/injector/TcpSourceDataInjector.js');

    const { TcpSourceService } = await import('./src/TcpSourceService.js');
    const { config } = await import('./config.js');

    /**
     * @class Repository
     */
    return class Repository extends ContainerAware {

        init() {
            this.initConfig();
            this.initAcl();
            this.initEntity();
            this.initHydrator();
            this.initDexieStorage();
            this.initService();
        }   
        
        
        /**
         * @returns Object
         */
        _getModuleConfig() {
            return  this.getContainer().get('ModuleConfig')['tcp-source']['tcp-source'];
        }

        /**
         * Init config
         */
        initConfig() {
            this.getContainer().set(
                'ModuleConfig',
                this.getContainer().get('merge').merge(this.getContainer().get('ModuleConfig'), config)
            );
        }
            
        /**
         *
         */
        initDexieStorage() {

            const dexieManager = this.getContainer().get(
                this._getModuleConfig().storage.adapter.dexie['connection-service']
            );

            /**
             * Add schema
             */
            let store = new Store(
                this._getModuleConfig().storage.adapter.dexie['collection'],
                ["++id", "name"]
            );
            dexieManager.addStore(store);

            /**
             * Create Schema
             */
            var generateSchema = () => {

                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['name-storage-service']
                );
                hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

                const adapter = new DexieTcpSourceAdapter(
                    dexieManager, 
                    this._getModuleConfig().storage.adapter.dexie['collection']
                );
                
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);
                storage.getEventManager()
                    .on(Storage.BEFORE_SAVE, (data) => {
                        data.data.id = MongoIdGenerator.statcGenerateId();
                    });
                    

                this.getContainer().get('StorageContainerAggregate').set(
                    this._getModuleConfig().storage['name-service'],
                    storage
                );

                let injector = new TcpSourceDataInjector(storage);
                this.getContainer().get(
                        this.getContainer().get('ModuleConfig')['timeslot']['timeslot']['injectorDataTimeslotAggregate']
                    ).set(injector.constructor.name, injector);
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
        initEntity() {
            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().entityService, 
                    new TcpSourceEntity()
            );
        }

        /**
         *
         */
        initHydrator() {
            this.getContainer()
                .get('HydratorContainerAggregate')
                .set(
                    this._getModuleConfig().hydrator['name-storage-service'],
                    Repository.getTcpSourceEntityHydrator(this.getContainer())
                );
        }

        /**
         * @param {ContainerAggregate} container
         */
        static getTcpSourceEntityHydrator(container) {
            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['tcp-source']['tcp-source'].entityService
                )
            );

            hydrator
                .addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

            /*
            hydrator
                .addValueStrategy('timeslots', timeslotStrategy)
                .addValueStrategy('binds', playlistStrategy)
                .addValueStrategy('enableAudio', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE));
            */

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('_id')
                .enableExtractProperty('status')
                .enableExtractProperty('name')
                .enableExtractProperty('port')
                .enableExtractProperty('interval')
                .enableExtractProperty('ip');

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('_id')
                .enableHydrateProperty('status')
                .enableHydrateProperty('name')
                .enableHydrateProperty('port')
                .enableHydrateProperty('interval')
                .enableHydrateProperty('ip')

            return hydrator;
        }
        

        initService() {
            this.getContainer()
                .set(
                    'TcpSourceService',
                    new TcpSourceService(
                        this.getContainer().get('SenderContainerAggregate').get(this._getModuleConfig().timeslotSender),
                        this.getContainer().get('Timer')
                    )
                );
        }

        /**
         * Init acl
         */
        initAcl() {
            if (this.getContainer().has('Acl')) {

                let aclService = this.getContainer().get('Acl');
                let resource = this.getContainer().get('ModuleConfig')['tcp-source']['tcp-source'].acl.resource;
            
                aclService.addResource(resource);
                aclService.allow('guest', resource);
            }
        }
    }   
}