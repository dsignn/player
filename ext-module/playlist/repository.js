console.log('sucaaaaaaaaaaaaaaaaaaaaaaaaa');
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
    const { PropertyHydrator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/PropertyHydrator.js`));
    const { MongoDb } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/mongo/MongoDb.js`));
    const { Store } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/Store.js`));
    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));
    
    const { MongoPlaylistAdapter } = await import('./src/storage/adapter/mongo/MongoPlaylistAdapter.js');
    const { DexiePlaylistAdapter } = await import('./src/storage/adapter/dexie/DexiePlaylistAdapter.js');
    const { PlaylistService } = await import('./src/PlaylistService.js');
    const { PlaylistEntity } = await import('./src/entity/PlaylistEntity.js');
    const { TimeslotPlaylistReference } = await import('./src/entity/TimeslotPlaylistReference.js');

    const { config } = await import('./config.js');

    /**
     * @class Repository
     */
    return class Repository extends ContainerAware {

        /**
         * @return {string}
         * @constructor
         */
        static get PLAYLIST_TIMESLOT_REF_SERVICE() { return 'TimeslotPlaylistReference'; };

        /**
         * @return {string}
         * @constructor
         */
        static get PLAYLIST_ENTITY_SERVICE() { return 'PlaylistEntity'; };

        /**
         * @return {string}
         * @constructor
         */
        static get PLAYLIST_HYDRATOR_SERVICE() { return 'PlaylistEntityHydrator'; };


        /**
         * @returns Object
         */
        _getModuleConfig() {
            return  this.getContainer().get('ModuleConfig')['playlist']['playlist'];
        }

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
        initDexieStorage() {

            const dexieManager = this.getContainer().get(
                this._getModuleConfig().storage.adapter.dexie['connection-service']
            );

            /**
             * Add schema
             */
            let store = new Store(
                this._getModuleConfig().storage.adapter.dexie['collection'],
                ["++id", "name", "status"]
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

                const adapter = new DexiePlaylistAdapter(
                    dexieManager, 
                    this._getModuleConfig().storage.adapter.dexie['collection']
                );
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);

                this.getContainer().get('StorageContainerAggregate').set(
                    this._getModuleConfig().storage['name-service'],
                    storage
                );

                this.initPlaylistService();
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

            let loadStorage = () => {

                const adapter = new MongoPlaylistAdapter(
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

                this.initPlaylistService();
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
        initEntity() {
            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().entityService, 
                    new PlaylistEntity()
            );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().entityServiceTimeslotRef, 
                    new TimeslotPlaylistReference()
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
                    Repository.getPlaylistEntityHydrator(this.getContainer())
                );
        }

        /**
         *
         */
        initPlaylistService() {
            this.getContainer()
                .set(
                    this._getModuleConfig().playlistService,
                    new PlaylistService(
                        this.getContainer().get('StorageContainerAggregate').get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].storage['name-service']),
                        this.getContainer().get('SenderContainerAggregate').get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].timeslotSender),
                        this.getContainer().get('Timer'),
                        this.getContainer().get(this.getContainer().get('ModuleConfig')['timeslot']['timeslot'].injectorDataTimeslotAggregate),
                        this.getContainer().get('StorageContainerAggregate').get(this._getModuleConfig().storage['name-service'])
                    )
                );
        }

        /**
         * @param {ContainerAggregate} container
         */
        static getPlaylistEntityHydrator(container) {
            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['playlist']['playlist'].entityService
                )
            );

            let timeslotStrategy = new HydratorStrategy();
            timeslotStrategy.setHydrator(Repository.getTimeslotReferenceHydrator(container));

            let playlistStrategy = new HydratorStrategy();
            playlistStrategy.setHydrator(Repository.getPlaylistReferenceHydrator(container));

            hydrator
                //.addPropertyStrategy('id', new MapPropertyStrategy('id', '_id'))
                //.addPropertyStrategy('_id', new MapPropertyStrategy('id', '_id'))
                .addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

            hydrator
                //.addValueStrategy('id', new MongoIdStrategy())
                //.addValueStrategy('_id', new MongoIdStrategy())
                .addValueStrategy('timeslots', timeslotStrategy)
                .addValueStrategy('binds', playlistStrategy)
                .addValueStrategy('enableAudio', new HybridStrategy(HybridStrategy.BOOLEAN_TYPE, HybridStrategy.NUMBER_TYPE));

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('_id')
                .enableExtractProperty('name')
                .enableExtractProperty('status')
                .enableExtractProperty('context')
                .enableExtractProperty('rotation')
                .enableExtractProperty('enableAudio')
                .enableExtractProperty('currentIndex')
                .enableExtractProperty('binds')
                .enableExtractProperty('timeslots');

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('_id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('status')
                .enableHydrateProperty('context')
                .enableHydrateProperty('rotation')
                .enableHydrateProperty('enableAudio')
                .enableHydrateProperty('currentIndex')
                .enableHydrateProperty('binds')
                .enableHydrateProperty('timeslots');

            return hydrator;
        }

        /**
         * @param container
         * @return {PropertyHydrator}
         */
        static getTimeslotReferenceHydrator(container) {

            let monitorContainerStrategy = new HydratorStrategy();
            monitorContainerStrategy.setHydrator(new PropertyHydrator(
                container.get('EntityContainerAggregate').get('EntityNestedReference')
            ));

            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['playlist']['playlist'].entityServiceTimeslotRef
                )
            );
            hydrator.addValueStrategy('monitorContainerReference', monitorContainerStrategy)
                .addValueStrategy('duration', new NumberStrategy())
                .addValueStrategy('currentTime', new NumberStrategy());

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('parentId')
                .enableHydrateProperty('collection')
                .enableHydrateProperty('monitorContainerReference')
                .enableHydrateProperty('name')
                .enableHydrateProperty('duration')
                .enableHydrateProperty('currentTime');

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('parentId')
                .enableExtractProperty('collection')
                .enableExtractProperty('monitorContainerReference')
                .enableExtractProperty('name')
                .enableExtractProperty('duration')
                .enableExtractProperty('currentTime');

            return hydrator;
        }

        /**
         * @param container
         * @return {PropertyHydrator}
         */
        static getPlaylistReferenceHydrator(container) {

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
         *
         */
        initAcl() {

            if (this.getContainer().has('Acl')) {

                let aclService = this.getContainer().get('Acl');

                // TODO add method on service
                aclService.addResource('playlist');
                aclService.allow('guest', 'playlist');
            }
        }
    }
}