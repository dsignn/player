/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const fs = require('fs');
const dsign = require('dsign-library');
const serviceManager = new dsign.serviceManager.ServiceManager();

/**
 * inject default services
 */
dsign.Application.injectServices(serviceManager);

serviceManager.eventManager.on(
    dsign.serviceManager.ServiceManager.LOAD_SERVICE,
    function(evt) {
        if (evt.data.name === 'Application') {

            serviceManager.set(
                'DexieManager',
                new  dsign.storage.adapter.manager.DexieManager(serviceManager.get('Application').config.indexedDB.name)
            );

            serviceManager.get('DexieManager').init();
        }
    }
);


/**
 * @type {Object}
 */
serviceManager.set(
    'Config',
    function (sm) {
        const fs = require('fs');
        return  JSON.parse(fs.readFileSync(__dirname + '/config/application.json'));
    }
).set(
    'Application',
    (function(sm){
        const fs = require('fs');
        let application =  new dsign.Application(
            JSON.parse(fs.readFileSync(__dirname + '/config/application.json')),
            'player'
        );

        application.setBasePath(__dirname);
        application.setResourcePath(`${__dirname}/storage/resource`);

        application.setServiceToLoad(
            'timeslot',
            ['Hydrator', 'Storage', 'TimeslotDataInjectorService']
        ).setServiceToLoad(
            'playlist',
            ['Hydrator', 'Storage']
        );

        application.init();

        return application;
    })()
);