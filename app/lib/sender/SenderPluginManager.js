
try {
    ServiceManager = require('/../service-manager/ServiceManager');
}
catch(err) {
    ServiceManager = require(__dirname + '/lib/service-manager/ServiceManager');
}

class SenderPluginManager extends ServiceManager {

    /**
     * @returns CommunicatorPluginManager
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new SenderPluginManager();
        }
        return this.instance;
    }
}
