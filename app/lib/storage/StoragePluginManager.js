

try {
    ServiceManager = require('/../service-manager/ServiceManager');
}
catch(err) {
    ServiceManager = require(__dirname + '/lib/service-manager/ServiceManager');
}

class StoragePluginManager extends ServiceManager {

    /**
     * @returns StoragePluginManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new StoragePluginManager();
        }
        return this.instance;
    }
}
