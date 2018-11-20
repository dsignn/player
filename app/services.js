/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const serviceManager = new ServiceManager();
const fs = require('fs');
/**
 * inject default services
 */
Application.injectServices(serviceManager);

serviceManager.eventManager.on(
    ServiceManager.LOAD_SERVICE,
    function(evt) {
        if (evt.data.name === 'Application') {

            serviceManager.set(
                'DexieManager',
                new DexieManager(serviceManager.get('Application').config.indexedDB.name)
            );

            serviceManager.get('DexieManager').init();
        }
    }
);

/**
 * @type {Object}
 */
serviceManager.set(
    'PaperToastNotification',
    new PaperToastNotification('notification')
).set(
    'Config',
    function (sm) {
        const fs = require('fs');
        return  JSON.parse(fs.readFileSync(__dirname + '/config/application.json'));
    }
).set(
    'Timer',
    function (sm) {
        const Timer = require('../node_modules/easytimer.js/dist/easytimer.min.js');

        let timer =  new Timer();
        timer.start({precision: 'secondTenths'});
        return timer;

    }
).set(
    'Application',
    (function(sm){
        const fs = require('fs');
        let application = null;
        if (!application)  {
            application = new Application(
                JSON.parse(fs.readFileSync(__dirname + '/config/application.json')),
                'dashboard'
            );
            application.setBasePath(__dirname);
            application.setResourcePath(`${__dirname}/storage/resource`);
        }

        application.init();

        return application;
    })()
).set(
    'TcpServer',
    function(sm){
        let config = sm.get('Config');

        return new TcpServer(
            config.tcpClient ? config.tcpClient : {}
        );
    }
).set(
    'SoccerClient',
    function(sm){
        let config = sm.get('Config');

        return new HttpClient(config.soccerApi.path, config.soccerApi.headers)
    }
);