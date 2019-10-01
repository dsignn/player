/**
 *
 */
class MonitorConfig extends require("@dsign/library").container.ContainerAware {

    /**
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'monitor'; };

    /**
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'MonitorStorage'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_CONTAINER_ENTITY_SERVICE() { return 'MonitorContainerEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_ENTITY_SERVICE() { return 'MonitorEntity'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_CONTAINER_HYDRATOR_SERVICE() { return 'MonitorContaninerEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_HYDRATOR_SERVICE() { return 'MonitorEntityHydrator'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_SENDER_SERVICE() { return 'MonitorSender'; };

    /**
     * @return {string}
     * @constructor
     */
    static get MONITOR_RECEIVER_SERVICE() { return 'MonitorReceiver'; };


    /**
     *
     */
    init() {

        this.initAcl();
        this.initEntity();
        this.initSender();
        this.initReceiver();
        this.initHydrator();
        this.initMongoStorage();
    }

    /**
     *
     */
    initDexieStorage() {

        const dexieManager = this.getContainer().get('DexieManager');

        /**
         * Add schema
         */
        let store = new (require("@dsign/library").storage.adapter.dexie.Store)(
            MonitorConfig.COLLECTION,
            ["++id", "name", "enable"]

        );

        dexieManager.addStore(store);


        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {

            const adapter = new DexieMonitorAdapter(dexieManager, MonitorConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(MonitorConfig.MONITOR_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                MonitorConfig.STORAGE_SERVICE,
                storage
            );

            let dashboardAlwayOnTop =  this.getContainer().get('Config').dashboard &&  this.getContainer().get('Config').dashboard.alwaysOnTop ?
                this.getContainer().get('Config').dashboard.alwaysOnTop : false;

            this.getContainer().set(
                'MonitorService',
                new MonitorService(
                    storage,
                    this.getContainer().get('SenderContainerAggregate').get(MonitorConfig.MONITOR_SENDER_SERVICE),
                    dashboardAlwayOnTop
                )
            )
        });
    }

    /**
     *
     */
    initMongoStorage() {

        let loadStorage = () => {

            const adapter = new MongoMonitorAdapter(this.getContainer().get('MongoDb'), MonitorConfig.COLLECTION);
            const storage = new (require("@dsign/library").storage.Storage)(adapter);

            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(MonitorConfig.MONITOR_CONTAINER_HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                MonitorConfig.STORAGE_SERVICE,
                storage
            );

            let dashboardAlwayOnTop =  this.getContainer().get('Config').dashboard &&  this.getContainer().get('Config').dashboard.alwaysOnTop ?
                this.getContainer().get('Config').dashboard.alwaysOnTop : false;

            this.getContainer().set(
                'MonitorService',
                new MonitorService(
                    storage,
                    this.getContainer().get('SenderContainerAggregate').get(MonitorConfig.MONITOR_SENDER_SERVICE),
                    dashboardAlwayOnTop
                )
            )
        };


        if (!this.getContainer().get('MongoDb')) {
            return;
        }

        if (this.getContainer().get('MongoDb').isConnected()) {
            loadStorage();
        } else {
            this.getContainer().get('MongoDb').getEventManager().on(
                require("@dsign/library").storage.adapter.mongo.MongoDb.READY_CONNECTION,
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
            .set(MonitorConfig.MONITOR_CONTAINER_ENTITY_SERVICE, new MonitorContainerEntity());

        this.getContainer()
            .get('EntityContainerAggregate')
            .set(MonitorConfig.MONITOR_ENTITY_SERVICE, new MonitorEntity());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                MonitorConfig.MONITOR_CONTAINER_HYDRATOR_SERVICE,
                MonitorConfig.getMonitorContainerEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                MonitorConfig.MONITOR_HYDRATOR_SERVICE,
                MonitorConfig.getMonitorEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            )
    }

    /**
     *
     */
    initSender() {

        let sender = new  (require("@dsign/library").sender.ProxyIpc)(
            this.getContainer().get('Config').sender.ipcProxy.proxyName
        );

        this.getContainer()
            .get('SenderContainerAggregate')
            .set(
                MonitorConfig.MONITOR_SENDER_SERVICE,
                sender
            );
    }

    /**
     *
     */
    initReceiver() {
        this.getContainer()
            .get('ReceiverContainerAggregate')
            .set(
                MonitorConfig.MONITOR_RECEIVER_SERVICE,
                require('electron').ipcRenderer
            );
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('monitor');
            aclService.adapter.acl.allow('guest', 'monitor');
        }
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getMonitorContainerEntityHydrator(container) {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(MonitorConfig.MONITOR_CONTAINER_ENTITY_SERVICE)
        );

        let strategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        strategy.setHydrator(MonitorConfig.getMonitorEntityHydrator(container));

        hydrator.addPropertyStrategy(
            'id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        ).addPropertyStrategy(
            '_id',
            new (require("@dsign/library").hydrator.strategy.property.MapHydratorStrategy)('id', '_id')
        );

        hydrator.addValueStrategy('id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)())
            .addValueStrategy('_id', new (require("@dsign/library").hydrator.strategy.value.MongoIdStrategy)())
            .addValueStrategy('monitors', strategy)
            .addValueStrategy('enable', new (require("@dsign/library").hydrator.strategy.value.HybridStrategy)(
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.BOOLEAN_TYPE,
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.NUMBER_TYPE
            ));

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('_id')
            .enableExtractProperty('name')
            .enableExtractProperty('enable')
            .enableExtractProperty('monitors');

        hydrator.enableHydrateProperty('id')

            .enableHydrateProperty('_id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('enable')
            .enableHydrateProperty('monitors');

        return hydrator;
    }

    /**
     * @param {ContainerAggregate} container
     */
    static getMonitorEntityHydrator(container) {
        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(MonitorConfig.MONITOR_ENTITY_SERVICE)
        );

        let strategy = new (require("@dsign/library").hydrator.strategy.value.HydratorStrategy)();
        strategy.setHydrator(hydrator);

        hydrator.addValueStrategy('monitors', strategy)
            .addValueStrategy('alwaysOnTop', new (require("@dsign/library").hydrator.strategy.value.HybridStrategy)(
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.BOOLEAN_TYPE,
                require("@dsign/library").hydrator.strategy.value.HybridStrategy.NUMBER_TYPE
            ));

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('backgroundColor')
            .enableExtractProperty('polygon')
            .enableExtractProperty('monitors')
            .enableExtractProperty('alwaysOnTop')
            .enableExtractProperty('defaultTimeslotId');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('backgroundColor')
            .enableHydrateProperty('polygon')
            .enableHydrateProperty('monitors')
            .enableHydrateProperty('alwaysOnTop')
            .enableHydrateProperty('defaultTimeslotId');

        return hydrator;
    }

    /**
     * @param container
     * @return {PropertyHydrator}
     */
    static getMonitorContainerReferenceHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)();
        hydrator.setTemplateObjectHydration(container.get('EntityNestedReference'));

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('collection')
            .enableHydrateProperty('name')
            .enableHydrateProperty('parentId');


        hydrator.enableExtractProperty('id')
            .enableExtractProperty('collection')
            .enableExtractProperty('name')
            .enableExtractProperty('parentId');

        return hydrator;
    }
}


module.exports = MonitorConfig;
