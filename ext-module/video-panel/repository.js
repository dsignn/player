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
     
    const { VideoPanelContainerEntity } = await import('./src/entity/VideoPanelContainerEntity.js');
    const { VideoPanelResourceContainerEntity } = await import('./src/entity/VideoPanelResourceContainerEntity.js');
    const { VideoPanelResource } = await import('./src/entity/embedded/VideoPanelResource.js');
    const { MonitorMosaic } = await import('./src/entity/embedded/MonitorMosaic.js');
    const { ResourceMosaic } = await import('./src/entity/embedded/ResourceMosaic.js');
    const { VideoPanel } = await import('./src/entity/embedded/VideoPanel.js');
    const { VideoPanelMosaic } = await import('./src/entity/embedded/VideoPanelMosaic.js');
    const { MongoVideoPanelResourceAdapter } = await import('./src/storage/adapter/mongo/MongoVideoPanelResourceAdapter.js');
    const { MongoVideoPanelAdapter } = await import('./src/storage/adapter/mongo/MongoVideoPanelAdapter.js');
    const { DexieVideoPanelAdapter } = await import('./src/storage/adapter/dexie/DexieVideoPanelAdapter.js');
    const { DexieVideoPanelResourceAdapter } = await import('./src/storage/adapter/dexie/DexieVideoPanelResourceAdapter.js');

    var repository = await import(`${container.get('Application').getBasePath()}module/monitor/repository.js`);
    const MonitorRepository = repository.Repository;
   
    repository = await import(`${container.get('Application').getBasePath()}module/resource/repository.js`);
    const ResourceRepository = repository.Repository;
     
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
            this.initVideoPanelDexieStorage();
            this.initVideoPanelResourceDexieStorage();
        }

        /**
         * @returns Object
         */
        _getModuleConfig() {
            return  this.getContainer().get('ModuleConfig')['video-panel']['video-panel'];
        }

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
                    new VideoPanelContainerEntity()
            );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().entityServiceContainer,
                    new VideoPanelResourceContainerEntity()
                );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().embedded.videoPanel,
                    new VideoPanel()
                );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().embedded.videoPanelResource,
                    new VideoPanelResource()
                );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().embedded.monitorMosaic, 
                    new MonitorMosaic()
                );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().embedded.videoPanelMosaic, 
                    new VideoPanelMosaic()
                );

            this.getContainer()
                .get('EntityContainerAggregate')
                .set(
                    this._getModuleConfig().embedded.resourceMosaic, 
                    new ResourceMosaic()
                );
        }

        /**
         *
         */
        initHydrator() {

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['video-panel-hydrator'],
                Repository.getVideoPanelHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['video-panel-resource-container-hydrator'],
                Repository.getVideoPanelResourceContainerEntityHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['video-panel-container-entity-hydrator'],
                Repository.getVideoPanelContainerEntityHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['video-panel-to-video-panel-resource-container-hydrator'],
                Repository.geVideoPanelToVideoPanelResourceHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['monitor-container-mosaic-hydrator'],
                Repository.getMonitorContainerEntityForMosaicHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['video-panel-container-mosaic-hydrator'],
                Repository.getVideoPanelContainerForMosaicHydrator(this.getContainer())
            );

            this.getContainer().get('HydratorContainerAggregate').set(
                this._getModuleConfig()['hydrator']['resource-mosaic-hydrator'],
                Repository.getResourceMosaicHydrator(this.getContainer())
            );
        }

        initVideoPanelDexieStorage() {
            const dexieManager = this.getContainer().get(
                this._getModuleConfig()['storage-video-panel'].adapter.dexie['connection-service']
            );

            /**
             * Add schema
             */
            let store = new Store(
                this._getModuleConfig()['storage-video-panel'].adapter.dexie['collection'],
                ["++id", "name"]
            );

            dexieManager.addStore(store);

                        /**
             * Create Schema
             */
            var generateSchema = () => {

                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['video-panel-container-entity-hydrator']
                );
                hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

                const adapter = new DexieVideoPanelAdapter(
                    dexieManager, 
                    this._getModuleConfig()['storage-video-panel'].adapter.dexie['collection']
                );
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);

                this.getContainer().get('StorageContainerAggregate').set(
                    this._getModuleConfig()['storage-video-panel']['name-service'],
                    storage
                );

                this.initVideoPanelService();
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

        initVideoPanelResourceDexieStorage() {
            const dexieManager = this.getContainer().get(
                this._getModuleConfig()['storage-video-panel-resource'].adapter.dexie['connection-service']
            );

            /**
             * Add schema
             */
            let store = new Store(
                this._getModuleConfig()['storage-video-panel-resource'].adapter.dexie['collection'],
                ["++id", "name"]
            );

            dexieManager.addStore(store);

                        /**
             * Create Schema
             */
            var generateSchema = () => {

                let hydrator = this.getContainer().get('HydratorContainerAggregate').get(
                    this._getModuleConfig().hydrator['video-panel-resource-container-hydrator']
                );
                hydrator.addPropertyStrategy('_id', new MapPropertyStrategy('id', 'id'));

                const adapter = new DexieVideoPanelResourceAdapter(
                    dexieManager, 
                    this._getModuleConfig()['storage-video-panel-resource'].adapter.dexie['collection']
                );
                const storage = new Storage(adapter);
                storage.setHydrator(hydrator);

                this.getContainer().get('StorageContainerAggregate').set(
                    this._getModuleConfig()['storage-video-panel-resource']['name-service'],
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
        initVideoPanelMongoStorage() {

            let loadStorage = () => {

                const adapter = new MongoVideoPanelAdapter(
                    this.getContainer().get(this._getModuleConfig()['storage-video-panel'].adapter.mongo['connection-service']), 
                    this._getModuleConfig()['storage-video-panel'].adapter.mongo['collection']
                );
                
                const storage = new Storage(adapter);

                storage.setHydrator(
                    this.getContainer()
                        .get('HydratorContainerAggregate')
                        .get(this._getModuleConfig()['hydrator']['video-panel-container-mosaic-hydrator'])
                );

                this.getContainer()
                    .get('StorageContainerAggregate').set(
                        this._getModuleConfig()['storage-video-panel']['name-service'],
                        storage
                    );

                this.initVideoPanelService();
            };

            if (!this.getContainer().get(this._getModuleConfig()['storage-video-panel'].adapter.mongo['connection-service'])) {
                return;
            }

            if (this.getContainer().get(this._getModuleConfig()['storage-video-panel'].adapter.mongo['connection-service']).isConnected()) {
                loadStorage();
            } else {
                this.getContainer().get(this._getModuleConfig()['storage-video-panel'].adapter.mongo['connection-service']).getEventManager().on(MongoDb.READY_CONNECTION, loadStorage);
            }
        }

        /**
         *
         */
        initVideoPanelResourceMongoStorage() {

            let loadStorage = () => {

                const adapter = new MongoVideoPanelResourceAdapter(
                    this.getContainer().get(this._getModuleConfig()['storage-video-panel-resource'].adapter.mongo['connection-service']), 
                    this._getModuleConfig()['storage-video-panel-resource'].adapter.mongo['collection']
                );
               
                const storage = new Storage(adapter);

                storage.setHydrator(
                    this.getContainer()
                        .get('HydratorContainerAggregate')
                        .get(
                            this._getModuleConfig()['hydrator']['video-panel-resource-container-hydrator']
                        )
                );

                this.getContainer()
                    .get('StorageContainerAggregate').set(
                        this._getModuleConfig()['storage-video-panel-resource']['name-service'],
                        storage
                    );
            };

            if (!this.getContainer().get(this._getModuleConfig()['storage-video-panel-resource'].adapter.mongo['connection-service'])) {
                return;
            }

            if (this.getContainer().get(this._getModuleConfig()['storage-video-panel-resource'].adapter.mongo['connection-service']).isConnected()) {
                loadStorage();
            } else {
                this.getContainer().get(this._getModuleConfig()['storage-video-panel-resource'].adapter.mongo['connection-service']).getEventManager().on(MongoDb.READY_CONNECTION, loadStorage);
            }
        }

        /**
         *
         */
        initVideoPanelService() {

            const fs = require('fs');
            const path = require('path');
            
            let pathTmp = path.normalize(this.getContainer().get('Application').getStoragePath() + '/../video-panel/tmp');
            fs.promises.mkdir(pathTmp, { recursive: true })

            this.getContainer().set(
                this._getModuleConfig().videoPanelService,
                new VideoPanelService(
                    this.getContainer().get('StorageContainerAggregate').get(this.getContainer().get('ModuleConfig')['monitor']['monitor'].storage['name-service']),
                    this.getContainer().get('StorageContainerAggregate').get(this._getModuleConfig()['storage-video-panel']['name-service']),
                    this.getContainer().get('StorageContainerAggregate').get(this.getContainer().get('ModuleConfig')['resource']['resource'].storage['name-service']),
                    this.getContainer().get('HydratorContainerAggregate').get(this._getModuleConfig()['hydrator']['monitor-container-mosaic-hydrator']),
                    this.getContainer().get('HydratorContainerAggregate').get(this._getModuleConfig()['hydrator']['video-panel-container-mosaic-hydrator']),
                    this.getContainer().get('HydratorContainerAggregate').get(this._getModuleConfig()['hydrator']['resource-mosaic-hydrator']),
                    this.getContainer().get('ResourceService'),
                    pathTmp
                )
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
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getVideoPanelContainerEntityHydrator(container) {

            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].entityService),
                {
                    videoPanel : new HydratorStrategy(Repository.getVideoPanelHydrator(container)),
                }
            );

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('videoPanel');

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('name')
                .enableExtractProperty('videoPanel');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getVideoPanelResourceContainerEntityHydrator(container) {
            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].entityServiceContainer
                ),
                {
                    resourceReference: new HydratorStrategy(ResourceRepository.getResourceReferenceHydrator(container)),
                    videoPanelResource: new HydratorStrategy(Repository.getVideoPanelResourceHydrator(container))
                }
            );


            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('videoPanelResource')
                .enableHydrateProperty('resourceReference');

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('name')
                .enableExtractProperty('videoPanelResource')
                .enableExtractProperty('resourceReference');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getVideoPanelResourceHydrator(container) {

            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].embedded.videoPanelResource
                ),
                {
                    resourceReference: new HydratorStrategy(ResourceRepository.getResourceHydrator(container)),
                    videoPanelReference: new HydratorStrategy(Repository.geVideoPanelContainerReferenceHydrator(container))
                }
            );

            hydrator.addValueStrategy(
                'videoPanelResources',
                new HydratorStrategy(hydrator)
            );

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('_id')
                .enableHydrateProperty('resources')
                .enableHydrateProperty('videoPanelReference')
                .enableHydrateProperty('videoPanelResources');

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('_id')
                .enableExtractProperty('resources')
                .enableExtractProperty('videoPanelReference')
                .enableExtractProperty('videoPanelResources');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {PropertyHydrator}
         */
        static getVideoPanelHydrator(container) {

            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].embedded.videoPanel
                ),
                {
                    width: new NumberStrategy(),
                    height: new NumberStrategy(),
                    monitorContainerReference: new HydratorStrategy(MonitorRepository.getMonitorContainerReferenceHydrator(container))
                }
            );

            hydrator.addValueStrategy(
                'videoPanels',
                new HydratorStrategy(hydrator)
            );

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('_id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('width')
                .enableHydrateProperty('height')
                .enableHydrateProperty('videoPanels')
                .enableHydrateProperty('monitorContainerReference');

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('_id')
                .enableExtractProperty('name')
                .enableExtractProperty('width')
                .enableExtractProperty('height')
                .enableExtractProperty('videoPanels')
                .enableExtractProperty('monitorContainerReference');


            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {HydratorInterface}
         */
        static geVideoPanelContainerReferenceHydrator(container) {

            let hydrator = new PropertyHydrator();
            hydrator.setTemplateObjectHydration(
                container.get('EntityContainerAggregate').get('EntityNestedReference')
            );

            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('collection')
                .enableHydrateProperty('name')
                .enableHydrateProperty('parentId')
                .enableHydrateProperty('parentName');


            hydrator.enableExtractProperty('id')
                .enableExtractProperty('collection')
                .enableExtractProperty('name')
                .enableExtractProperty('parentId')
                .enableExtractProperty('parentName');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @return {HydratorInterface}
         */
        static geVideoPanelToVideoPanelResourceHydrator(container) {

            let hydrator = new VideoPanelToVideoPanelResourceHydrator();
            hydrator.setTemplateObjectHydration(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].embedded.videoPanelResource
                )
            );

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @returns {HydratorInterface}
         */
        static getMonitorContainerEntityForMosaicHydrator(container) {
            let hydrator = MonitorRepository.getMonitorContainerEntityHydrator(container);

            hydrator.addValueStrategy(
                'monitors',
                new HydratorStrategy(Repository.getMonitorMosaicHydrator(container))
            );

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @returns {HydratorInterface}
         */
        static getMonitorMosaicHydrator(container) {
            let hydrator = MonitorRepository.getMonitorEntityHydrator(container);
            
            hydrator.setTemplateObjectHydration(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].embedded.monitorMosaic
                )
            );

            hydrator.addValueStrategy('monitors', new HydratorStrategy(hydrator))
                .addValueStrategy('progressOffsetX', new NumberStrategy())
                .addValueStrategy('progressOffsetY', new NumberStrategy());

            hydrator.enableHydrateProperty('progressOffsetX')
                .enableHydrateProperty('progressOffsetY');

            hydrator.enableExtractProperty('progressOffsetX')
                .enableExtractProperty('progressOffsetY');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @returns {HydratorInterface}
         */
        static getVideoPanelContainerForMosaicHydrator(container) {

            let hydrator = Repository.getVideoPanelContainerEntityHydrator(container);

            hydrator.addValueStrategy(
                'videoPanel',
                new HydratorStrategy(Repository.getVideoPanelMosaicHydrator(container))
            );

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @returns {HydratorInterface}
         */
        static getVideoPanelMosaicHydrator(container) {

            let hydrator = Repository.getVideoPanelHydrator(container);
            hydrator.setTemplateObjectHydration(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].embedded.videoPanelMosaic
                )
            );

            hydrator.addValueStrategy('videoPanels', new HydratorStrategy(hydrator))
                .enableHydrateProperty('computedWidth')
                .enableExtractProperty('computedWidth');

            return hydrator;
        }

        /**
         * @param {ContainerInterface} container
         * @returns {HydratorInterface}
         */
        static getResourceMosaicHydrator(container) {

            let hydrator = new PropertyHydrator(
                container.get('EntityContainerAggregate').get(
                    container.get('ModuleConfig')['video-panel']['video-panel'].embedded.resourceMosaic
                )
            );

            let pathHydratorStrategy = new HydratorStrategy();
            pathHydratorStrategy.setHydrator(ResourceRepository.getPathHydrator(container));

            hydrator.addValueStrategy('path', pathHydratorStrategy);


            hydrator.enableHydrateProperty('id')
                .enableHydrateProperty('name')
                .enableHydrateProperty('size')
                .enableHydrateProperty('type')
                .enableHydrateProperty('path')
                .enableHydrateProperty('tags')
                .enableHydrateProperty('lastModified')
                .enableHydrateProperty('dimension')
                .enableHydrateProperty('computedWidth');

            hydrator.enableExtractProperty('id')
                .enableExtractProperty('name')
                .enableExtractProperty('size')
                .enableExtractProperty('type')
                .enableExtractProperty('path')
                .enableExtractProperty('tags')
                .enableExtractProperty('lastModified')
                .enableExtractProperty('dimension')
                .enableExtractProperty('computedWidth');

            return hydrator;
        }
    }
}