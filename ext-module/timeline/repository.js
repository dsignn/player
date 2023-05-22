export async function Repository() {    

    const { ContainerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/container/ContainerAware.js`));
    const { HydratorStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/value/HydratorStrategy.js`));
    const { HybridStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/value/HybridStrategy.js`));
    const { MongoIdStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/value/MongoIdStrategy.js`));
    const { NumberStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/value/NumberStrategy.js`));
    const { MapPropertyStrategy } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/strategy/proprerty/MapPropertyStrategy.js`));
    const { MongoIdGenerator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/util/MongoIdGenerator.js`)); 
    const { PropertyHydrator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/PropertyHydrator.js`));
    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));        
    const { MongoDb } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/mongo/MongoDb.js`));
    const { Store } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/Store.js`));
    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));

    const { TimelineEntity } = await import('./src/entity/TimelineEntity.js');
    const { TimelineItem } = await import('./src/entity/embedded/TimelineItem.js');
    const { TimeslotTimelineRefence } = await import('./src/entity/embedded/TimeslotTimelineRefence.js');
    const { MongoTimelineAdapter } = await import('./src/storage/adapter/mongo/MongoTimelineAdapter.js');
    const { DexieTimelineAdapter } = await import('./src/storage/adapter/dexie/DexieTimelineAdapter.js');

    const { config } = await import('./config.js');

    /**
     * @class Repository
     */
    return class Repository extends ContainerAware {

        /**
         *
         */
        init() {
            this.initConfig();
            this.initAcl();
            this.initEntity();
            this.initHydrator();
            this.initDexieStorage();
        }

        /**
         * @returns Object
         */
        _getModuleConfig() {
            return  this.getContainer().get('ModuleConfig')['timeline']['timeline'];
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
                    this._getModuleConfig().entityService, 
                    new TimelineEntity()
                );
        }

        /**
         *
         */
        initHydrator() {

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig().hydrator['name-storage-service'],
                Repository.getTimelineHydrator(this.getContainer())
            );

        }

        /**
         *
         */
        initAcl() {

            if (this.getContainer().has('Acl')) {

                let aclService = this.getContainer().get('Acl');

                // TODO add method on service
                aclService.addResource(this._getModuleConfig().acl.resource);
                aclService.allow('guest', this._getModuleConfig().acl.resource);
            }
        }

        /**
         *
         */
        initMongoStorage() {

            let loadStorage = () => {

                const adapter = new MongoTimelineAdapter(
                    this.getContainer().get('MongoDb'), 
                    this._getModuleConfig().storage.adapter.mongo['collection']
                );
                
                const storage = new Storage(adapter);
                storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['name-storage-service']
                ));

                this.getContainer().get('StorageContainerAggregate').set(
                    this._getModuleConfig().storage['name-service'],
                    storage
                );

                this.initTimelineService();
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

                const adapter = new DexieTimelineAdapter(
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

                this.initTimelineService();
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
        initTimelineService() {
            this.getContainer().set(
                this._getModuleConfig().timelineService,
                new TimelineService(
                    this.getContainer().get('StorageContainerAggregate').get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].storage['name-service']),
                    this.getContainer().get('SenderContainerAggregate').get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot']['timeslotSender']),
                    this.getContainer().get('Timer'),
                    this.getContainer().get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot']['injectorDataTimeslotAggregate']),
                    this.getContainer().get('StorageContainerAggregate').get(this._getModuleConfig().storage['name-service'])
                )
            );
        }

        /**
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getTimelineHydrator(container) {

            let hydrator =  new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['timeline']['timeline'].entityService
                ),
                {
                    timelineItems: new HydratorStrategy(Repository.getTimelineItemHydrator(container)),
                    binds: new HydratorStrategy(Repository.getTimelineReferenceHydrator(container)),
                    currentTime: new NumberStrategy()
                }
            );

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('_id')
                .enableExtractProperty('name')
                .enableExtractProperty('currentTime')
               
              //  .enableExtractProperty('time')
              //  .enableExtractProperty('timer')
               
                .enableExtractProperty('context')
                .enableExtractProperty('status')
                .enableExtractProperty('enableAudio')
                .enableExtractProperty('rotation')
                .enableExtractProperty('timelineItems')
                .enableExtractProperty('binds');

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('_id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('currentTime')
             
            //    .enableHydrateProperty('time')
            //    .enableHydrateProperty('timer')
             
                .enableHydrateProperty('context')
                .enableHydrateProperty('status')
                .enableHydrateProperty('enableAudio')
                .enableHydrateProperty('rotation')
                .enableHydrateProperty('timelineItems')
                .enableHydrateProperty('binds');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getTimelineItemHydrator(container) {

            let timeHydrator = new PropertyHydrator(new Time());
            timeHydrator.addValueStrategy('seconds', new NumberStrategy())
                .addValueStrategy('minutes', new NumberStrategy())
                .addValueStrategy('hours', new NumberStrategy());

            let hydrator = new PropertyHydrator(
                new TimelineItem(),
                {
                    time: new HydratorStrategy(timeHydrator),
                    timeslotReferences:  new HydratorStrategy(Repository.getTimeslotReferenceHydrator(container))
                }
            );

            hydrator.enableExtractProperty('timeslotReferences')
                .enableExtractProperty('time');

            hydrator.enableHydrateProperty('timeslotReferences')
                .enableHydrateProperty('time');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getTimelineReferenceHydrator(container) {

            let hydrator = new PropertyHydrator();
            hydrator.setTemplateObjectHydration(
                container.get('EntityContainerAggregate').get('EntityReference')
            );

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('collection')
                .enableHydrateProperty('name');


            hydrator.enableExtractProperty('id')
                .enableExtractProperty('collection')
                .enableExtractProperty('name');

            return hydrator;
        }

        /**
         * @param container
         * @return {PropertyHydrator}
         */
        static getTimeslotReferenceHydrator(container) {

            let hydrator = new PropertyHydrator();
            
            hydrator.setTemplateObjectHydration(
                new TimeslotTimelineRefence()
            );
            
            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('collection')
                .enableHydrateProperty('name')
                .enableHydrateProperty('duration');


            hydrator.enableExtractProperty('id')
                .enableExtractProperty('collection')
                .enableExtractProperty('name')
                 .enableExtractProperty('duration');


            hydrator.addValueStrategy('duration', new NumberStrategy())

            return hydrator;
        }
    }
}
