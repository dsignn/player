/**
 *
 */
class Config extends require("@p3e/library").container.ContainerAware {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'home'; };
    
    /**
     * 
     */
    init() {
        //this.getContainer().set('HomeService', new HomeService());
        this.initStorage();
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
            'store',
            ['id', 'test']

        );

        dexieManager.addStore(store);

        /**
         * Create Schema
         */
        dexieManager.on("ready", () => {
            let adapter = new (require("@p3e/library").storage.adapter.dexie.DexieAdapter)(dexieManager, 'store');
            console.log('ADAPETER', adapter)
        });
    }

    /**
     * 
     */
    initHydrator() {
        
    }
}


module.exports = Config;
