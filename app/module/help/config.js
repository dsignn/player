/**
 *
 */
class Config extends require("@p3e/library").container.ContainerAware {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'store'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'HelpStorage'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get ENTITY_SERVICE() { return 'HelpEntity'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get HYDRATOR_SERVICE() { return 'HelpEntityHydrator'; };
    
    init() {
        
        this.initStorage();
        this.initEntity();
        this.initHydrator();
    }

    /**
     *
     */
    initStorage() {
        const dexieManager = this.getContainer().get('DexieManager');

        /**
         * Add schema
         */
        let store = new (require("@p3e/library").storage.adapter.dexie.Store)(
            Config.COLLECTION,
            ['id', 'test']
        );

        dexieManager.addStore(store);

        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {

            const adapter = new (require("@p3e/library").storage.adapter.dexie.DexieAdapter)(dexieManager, Config.COLLECTION);
            const storage = new (require("@p3e/library").storage.Storage)(adapter);
            storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(Config.HYDRATOR_SERVICE));

            this.getContainer().get('StorageContainerAggregate').set(
                Config.STORAGE_SERVICE,
                storage
            )
        });
    }


    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(Config.ENTITY_SERVICE, new HelpEntity());
    }

    /**
     *
     */
    initHydrator() {
        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                Config.HYDRATOR_SERVICE,
                Config.getHelpEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            )
    }

    /**
     * 
     */
    static getHelpEntityHydrator(container) {
        let hydrator = new (require("@p3e/library").hydrator.PropertyHydrator)(
            container.get(Config.ENTITY_SERVICE)
        );

        return hydrator;
    }
}

module.exports = Config;