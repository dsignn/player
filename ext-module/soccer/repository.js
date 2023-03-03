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
    const { MongoIdGenerator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/util/MongoIdGenerator.js`));
    const { PropertyHydrator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/PropertyHydrator.js`));
    const { Store } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/Store.js`));
    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));
    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
    
    const { SoccerMatchEntity } = await import('./src/entity/SoccerMatchEntity.js');
    const { SoccerPlayerEntity } = await import('./src/entity/SoccerPlayerEntity.js');
    const { SoccerScore } = await import('./src/entity/embedded/SoccerScore.js');
    const { SoccerScoreboardService } = await import('./src/SoccerScoreboardService.js');
    const { SoccerTeam } = await import('./src/entity/embedded/SoccerTeam.js');
    const { MongoSoccerAdapter } = await import('./src/storage/adapter/mongo/MongoSoccerAdapter.js')
    const { ScoreboardDataInjector } = await import('./src/injector/ScoreboardDataInjector.js');

    //Repository = await import(`${container.get('Application').getBasePath()}module/resource/repository.js`);

    const { DexieSoccerAdapter } = await import('./src/storage/adapter/dexie/DexieSoccerAdapter.js');
    const { config } = await import('./config.js');

    // TODO REMOVE
  

    return class Repository extends ContainerAware {

        /**
         * Init
         */
        init() {
    
            this.initConfig();
            this.initEntity();
            this.initHydrator();
            this.initSoccerSender();
            this.initDexieStorage();
            //this.initMongoMatchStorage();
            this.initScoreboardService();
            this.initAcl();
        }
    
        /**
         * Merge config
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
        initEntity() {
            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].entityService,
                    new SoccerMatchEntity()
                );
        }
    
        /**
         *
         */
        initDexieStorage() {
    
            var connectorServiceName = this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage.adapter.dexie['connection-service'];
            var collection =    this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage.adapter.dexie.collection;
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
                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].hydrator['name-storage-service']);
                hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));
    
                const adapter = new DexieSoccerAdapter(dexieManager, collection);
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);
    
                this.getContainer().get('StorageContainerAggregate').set(
                    this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage['name-service'],
                    storage
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
        initMongoMatchStorage() {
    
            var connectorServiceName = this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage.adapter.mongo['connection-service'];
    
            let loadStorage = () => {
    
                const adapter = new MongoSoccerAdapter(
                    this.getContainer().get(connectorServiceName),
                    this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage.adapter.mongo.collection
                );
    
                const storage = new Storage(adapter);
    
                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].hydrator['name-storage-service']);
                hydrator.addPropertyStrategy('id', new MapPropertyStrategy('id', '_id'))
                    .addPropertyStrategy('_id', new MapPropertyStrategy('id', '_id'))
                    .addValueStrategy('id', new MongoIdStrategy())
                    .addValueStrategy('_id', new MongoIdStrategy());
    
                storage.setHydrator(hydrator);

                storage.getEventManager()
                    .on(Storage.BEFORE_SAVE, (data) => {
                        data.data.id = MongoIdGenerator.statcGenerateId();
                    });
    
                this.getContainer().get('StorageContainerAggregate').set(
                    this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage['name-service'],
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
         * Init
         */
        initAcl() {
            if (this.getContainer().has('Acl')) {
    
                let aclService = this.getContainer().get('Acl');
                let resource = this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].acl.resource;
             
                aclService.addResource(resource);
                aclService.allow('guest', resource);
            }
        }
    
        /**
         * Init
         */
        initHydrator() {
            this.getContainer()
                .get('HydratorContainerAggregate')
                .set(
                    this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].hydrator['name-storage-service'],
                    Repository.getSoccerMatchHydrator(this.getContainer())
                );
        }
    
        /**
         * Init
         */
        initScoreboardService() {
    
            let loadSoccerScoreboardService = () => {
                const service = new SoccerScoreboardService(
                    this.getContainer()
                        .get('StorageContainerAggregate')
                        .get(this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage['name-service']),
                    this.getContainer()
                        .get('SenderContainerAggregate')
                        .get(this.getContainer().get('ModuleConfig')['soccer'].senderService)
                );
            
                this.getContainer().set(
                    this.getContainer().get('ModuleConfig')['soccer']['scoreboard-service'],
                    service
                );
    
                this.getContainer().get(
                        this.getContainer().get('ModuleConfig')['timeslot']['timeslot']['injectorDataTimeslotAggregate']
                    ).set('ScoreboardDataInjector', new ScoreboardDataInjector(service));
            };
    
            var connectorServiceName = this.getContainer().get('ModuleConfig')['soccer']['soccer-match'].storage.adapter.dexie['connection-service'];
            const dexieManager = this.getContainer().get(connectorServiceName);
          
            if (!dexieManager) {
                return;
            }
    
            if(dexieManager.isOpen()) {
                loadSoccerScoreboardService();
            } else {
                dexieManager.on("ready", () => {
                    loadSoccerScoreboardService();
                });
            }
        }
    
        /**
         *
         */
        initSoccerSender() {
            this.getContainer()
                .get('SenderContainerAggregate')
                .set(this.getContainer().get(
                    'ModuleConfig')['soccer'].senderService,
                     require('electron').ipcRenderer
                );
        }
    
        /**
         * @return PropertyHydrator
         */
        static getSoccerMatchHydrator(container) {
    
            let teamHydratorStrategy = new HydratorStrategy();
            teamHydratorStrategy.setHydrator(Repository.getSoccerTeamHydrator(container));
    
            let periodHydratorStrategy = new HydratorStrategy();
            periodHydratorStrategy.setHydrator(Repository.getSoccerPeriosHydrator(container));
    
            let scoreHydratorStrategy = new HydratorStrategy();
            scoreHydratorStrategy.setHydrator(Repository.getSoccerScoreHydrator(container));
    
            let timeHydratorStrategy = new HydratorStrategy();
            timeHydratorStrategy.setHydrator(Repository.getTimeHydrator(container));
    
            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['soccer']['soccer-match'].entityService
                )
            );
    
            hydrator.addValueStrategy('homeTeam', teamHydratorStrategy)
                .addValueStrategy('homeScores', scoreHydratorStrategy)
                .addValueStrategy('guestTeam', teamHydratorStrategy)
                .addValueStrategy('guestScores', scoreHydratorStrategy)
                .addValueStrategy('periods', periodHydratorStrategy)
                .addValueStrategy('currentPeriod', periodHydratorStrategy)
                .addValueStrategy('time', timeHydratorStrategy);
    
            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('_id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('homeTeam')
                .enableHydrateProperty('homeScores')
                .enableHydrateProperty('guestTeam')
                .enableHydrateProperty('guestScores')
                .enableHydrateProperty('time')
                .enableHydrateProperty('periods');
    
            hydrator.enableExtractProperty('id')
                .enableExtractProperty('_id')
                .enableExtractProperty('name')
                .enableExtractProperty('homeTeam')
                .enableExtractProperty('homeScores')
                .enableExtractProperty('guestTeam')
                .enableExtractProperty('guestScores')
                .enableExtractProperty('time')
                .enableExtractProperty('periods');    
    
            return hydrator;
        }
    
        /**
         * @return PropertyHydrator
         */
        static getSoccerTeamHydrator(container) {
    
    
            let playerHydratorStrategy = new HydratorStrategy();
            playerHydratorStrategy.setHydrator(Repository.getSoccerPlayerHydrator(container));
    
            let resoyrceHydratorStrategy = new HydratorStrategy();
            resoyrceHydratorStrategy.setHydrator(
                container.get('HydratorContainerAggregate').get(
                    container.get('ModuleConfig')['resource']['resource'].hydrator['name-storage-service-resource']
                )
            );
    
            let hydrator = new PropertyHydrator(new SoccerTeam());
    
            hydrator.addValueStrategy('players', playerHydratorStrategy);
            hydrator.addValueStrategy('logo', resoyrceHydratorStrategy);
    
            return hydrator;
        }
    
        /**
         * @return PropertyHydrator
        */
        static getSoccerPeriosHydrator(container) {
    
            let hydrator = new PropertyHydrator(new SoccerTeam());
    
            return hydrator;
        }
    
        /**
         * @return PropertyHydrator
         */
        static getSoccerPlayerHydrator(container) {
    
            let hydrator = new PropertyHydrator(new SoccerPlayerEntity());
    
            return hydrator;
        }
    
        /**
         * @return PropertyHydrator
         */
        static getTimeHydrator(container) {
    
            let hydrator = new PropertyHydrator(new Time());
    
            return hydrator;
        }
    
    
        /**
         * @return PropertyHydrator
         */
        static getSoccerScoreHydrator(container) {
    
            let hydrator = new PropertyHydrator(new SoccerScore());
    
            return hydrator;
        }
    }
}

