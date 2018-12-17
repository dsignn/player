/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const serviceManager = new ServiceManager();
const fs = require('fs');
const fsExtra = require('fs-extra')
const archiver = require('archiver');
const admZip = require('adm-zip');

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
).set(
    'Backup',
    function (sm) {

        let serviceM = sm;
        let path = sm.get('Config').backup.path;
        let listeners = {
            progress: [],
            close : []
        };

        return {

            /**
             * @param event
             * @param callback
             */
            addEventListener: (event, callback) => {
                switch (event) {
                    case 'progress' :
                        listeners.progress.push(callback);
                        break;
                    case 'close' :
                        listeners.close.push(callback);
                        break
                }
            },

            archive: () => {
                // TODO riscrivere
                let archive = new Archive(
                    'zip',
                    `${path}bk.zip`,
                    { zlib: { level: 9 } }
                );

                if (listeners.progress.length) {
                    for (let cont = 0; listeners.progress.length > cont; cont++) {
                        archive.addEventListener('progress', listeners.progress[cont]);
                    }
                }

                if (listeners.close.length) {
                    for (let cont = 0; listeners.close.length > cont; cont++) {
                        archive.addEventListener('close', listeners.close[cont]);
                    }
                }

                archive.prepareArchive();

                archive.appendDirectory(`${__dirname}/storage/resource`, 'resource');

                let promises = [];
                let storageServices = serviceM.get('StoragePluginManager').services;
                for (let property in storageServices) {

                    promises.push(archive.appendStorageData(property, storageServices[property]));
                }

                Promise.all(promises).then(
                    () => {
                        archive.archive();
                    }
                ).catch((error) => {
                    console.log(error);
                });
            },

            restore : (path) => {

                // TODO riscrivere
                let pathDirBk = `${__dirname}/../tmp`;
                let zip = new admZip(path);

                fsExtra.emptyDirSync(pathDirBk);

                zip.extractAllTo(pathDirBk, true);

                fsExtra.move(`${pathDirBk}/resource`, `${__dirname}/storage/resource`, {overwrite:true}, (err) => {
                    if (err) {
                        return console.error(err)
                    }

                    console.info('Move Backup resource');
                });

                fs.readdir(pathDirBk, function(err, items) {


                    for (let cont=0; cont < items.length; cont++) {

                        let promises = [];
                        if (items[cont].indexOf(".json") > 0) {
                            fs.readFile(`${pathDirBk}/${items[cont]}`, (err, data) => {
                                if (err) {
                                    throw err;
                                }

                                try {
                                    let jsonData = JSON.parse(data.toString());

                                    if (jsonData.length > 0) {

                                        let storage = serviceM.get('StoragePluginManager').get(items[cont].replace('.json', ''));
                                        for (let contI = 0; jsonData.length > contI; contI++) {
                                            promises.push(storage.update(storage.hydrator.hydrate(jsonData[contI])));
                                        }

                                    }
                                } catch (e) {
                                    throw e;
                                }
                            });
                        }

                        if (promises.length > 0) {
                            Promise.all(promises).then(
                                () => {
                                    console.info('Storage import complete');
                                }
                            );
                        }
                    }
                });

            }
        };
    }
);