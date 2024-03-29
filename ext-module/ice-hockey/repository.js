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
    
    const { IceHockeyMatchEntity } = await import('./src/entity/IceHockeyMatchEntity.js');
    const { IceHockeyPlayerEntity } = await import('./src/entity/IceHockeyPlayerEntity.js');
    const { IceHockeyScore } = await import('./src/entity/embedded/IceHockeyScore.js');
    const { IceHockeyScoreboardService } = await import('./src/IceHockeyScoreboardService.js');
    const { IceHockeyTeam } = await import('./src/entity/embedded/IceHockeyTeam.js');
    const { DexieIceHockeyAdapter } = await import('./src/storage/adapter/dexie/DexieIceHockeyAdapter.js')
    const { MongoIceHockeyAdapter } = await import('./src/storage/adapter/mongo/MongoIceHockeyAdapter.js')
    const { ScoreboardIceHockeyDataInjector } = await import('./src/injector/ScoreboardIceHockeyDataInjector.js');
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
            this.initIceHockeySender();
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
                    this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].entityService,
                    new IceHockeyMatchEntity()
                );
        }
    
        /**
         *
         */
        initDexieStorage() {
    
            var connectorServiceName = this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage.adapter.dexie['connection-service'];
            var collection =    this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage.adapter.dexie.collection;
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
                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service']);
                hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));
    
                const adapter = new DexieIceHockeyAdapter(dexieManager, collection);
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);
    
                this.getContainer().get('StorageContainerAggregate').set(
                    this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage['name-service'],
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
    
            var connectorServiceName = this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage.adapter.mongo['connection-service'];
    
            let loadStorage = () => {
    
                const adapter = new MongoIceHockeyAdapter(
                    this.getContainer().get(connectorServiceName),
                    this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage.adapter.mongo.collection
                );
    
                const storage = new Storage(adapter);
    
                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service']);
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
                    this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage['name-service'],
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
                let resource = this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].acl.resource;
             
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
                    this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].hydrator['name-storage-service'],
                    Repository.getIceHockeyMatchHydrator(this.getContainer())
                );
        }
    
        /**
         * Init
         */
        initScoreboardService() {
    
            let loadIceHockeyScoreboardService = () => {
                const service = new IceHockeyScoreboardService(
                    this.getContainer()
                        .get('StorageContainerAggregate')
                        .get(this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage['name-service']),
                    this.getContainer()
                        .get('SenderContainerAggregate')
                        .get(this.getContainer().get('ModuleConfig')['ice-hockey'].senderService)
                );
            
                this.getContainer().set(
                    this.getContainer().get('ModuleConfig')['ice-hockey']['scoreboard-service'],
                    service
                );

                let injector = new ScoreboardIceHockeyDataInjector(service);
    
                this.getContainer().get(
                        this.getContainer().get('ModuleConfig')['timeslot']['timeslot']['injectorDataTimeslotAggregate']
                    ).set(injector.constructor.name, injector);
            };
    
            var connectorServiceName = this.getContainer().get('ModuleConfig')['ice-hockey']['ice-hockey-match'].storage.adapter.dexie['connection-service'];
            const dexieManager = this.getContainer().get(connectorServiceName);
          
            if (!dexieManager) {
                return;
            }
    
            if(dexieManager.isOpen()) {
                loadIceHockeyScoreboardService();
            } else {
                dexieManager.on("ready", () => {
                    loadIceHockeyScoreboardService();
                });
            }
        }
    
        /**
         *
         */
        initIceHockeySender() {
            this.getContainer()
                .get('SenderContainerAggregate')
                .set(this.getContainer().get(
                    'ModuleConfig')['ice-hockey'].senderService,
                     require('electron').ipcRenderer
                );
        }
    
        /**
         * @return PropertyHydrator
         */
        static getIceHockeyMatchHydrator(container) {
    
            let teamHydratorStrategy = new HydratorStrategy();
            teamHydratorStrategy.setHydrator(Repository.getIceHockeyTeamHydrator(container));
    
            let periodHydratorStrategy = new HydratorStrategy();
            periodHydratorStrategy.setHydrator(Repository.getIceHockeyPeriosHydrator(container));
    
            let scoreHydratorStrategy = new HydratorStrategy();
            scoreHydratorStrategy.setHydrator(Repository.getIceHockeyScoreHydrator(container));
    
            let timeHydratorStrategy = new HydratorStrategy();
            timeHydratorStrategy.setHydrator(Repository.getTimeHydrator(container));
    
            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['ice-hockey']['ice-hockey-match'].entityService
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
        static getIceHockeyTeamHydrator(container) {
    
    
            let playerHydratorStrategy = new HydratorStrategy();
            playerHydratorStrategy.setHydrator(Repository.getIceHockeyPlayerHydrator(container));
    
            let resoyrceHydratorStrategy = new HydratorStrategy();
            resoyrceHydratorStrategy.setHydrator(
                container.get('HydratorContainerAggregate').get(
                    container.get('ModuleConfig')['resource']['resource'].hydrator['name-storage-service-resource']
                )
            );
    
            let hydrator = new PropertyHydrator(new IceHockeyTeam());
    
            hydrator.addValueStrategy('players', playerHydratorStrategy);
            hydrator.addValueStrategy('logo', resoyrceHydratorStrategy);
    
            return hydrator;
        }
    
        /**
         * @return PropertyHydrator
        */
        static getIceHockeyPeriosHydrator(container) {
    
            let hydrator = new PropertyHydrator(new IceHockeyTeam());
    
            return hydrator;
        }
    
        /**
         * @return PropertyHydrator
         */
        static getIceHockeyPlayerHydrator(container) {
    
            let hydrator = new PropertyHydrator(new IceHockeyPlayerEntity());
    
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
        static getIceHockeyScoreHydrator(container) {
    
            let hydrator = new PropertyHydrator(new IceHockeyScore());
    
            return hydrator;
        }
    }
}

