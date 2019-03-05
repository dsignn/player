/**
 * Global service manager
 *
 * @type {ServiceManager}
 */
const fs = require('fs');
const fsExtra = require('fs-extra')
const archiver = require('archiver');
const admZip = require('adm-zip');
const dsign = require('dsign-library');
const serviceManager = new dsign.serviceManager.ServiceManager();

/**
 * inject default services
 */
dsign.core.Application.injectServices(serviceManager);

serviceManager.eventManager.on(
    dsign.serviceManager.ServiceManager.LOAD_SERVICE,
    function(evt) {
        if (evt.data.name === 'Application') {

            serviceManager.set(
                'DexieManager',
                new dsign.storage.adapter.manager.DexieManager(serviceManager.get('Application').config.indexedDB.name)
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
    new dsign.core.PaperToastNotification('notification')
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
            application = new dsign.core.Application(
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
    'Backup',
    function (sm) {

        let serviceM = sm;
        let pathToExtract =  sm.get('Config').backup.pathToExtract;
        let pathBk = sm.get('Config').backup.pathTmp;
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
                let date = new Date();
                let archive = new dsign.archive.Archive(
                    'zip',
                    `${pathToExtract}/backup-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${date.getHours()}:${date.getMinutes()}.zip`,
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


                fsExtra.emptyDirSync(pathBk);

                let zip = new admZip(path);
                zip.extractAllTo(pathBk, true);

                let promises = [];

                fsExtra.move(`${pathBk}/resource`, `${__dirname}/storage/resource`, {overwrite:true}, (err) => {
                    if (err) {
                        return console.error(err)
                    }

                    console.info('Move Backup resource');
                });

                fs.readdir(pathBk, function(err, items) {


                    for (let cont=0; cont < items.length; cont++) {

                        if (items[cont].indexOf(".json") > 0) {
                            fs.readFile(`${pathBk}/${items[cont]}`, (err, data) => {
                                if (err) {
                                    throw err;
                                }

                                let jsonData = JSON.parse(data.toString());

                                if (jsonData.length > 0) {

                                    promises = [];
                                    let storage = serviceM.get('StoragePluginManager').get(items[cont].replace('.json', ''));
                                    for (let contI = 0; jsonData.length > contI; contI++) {
                                        promises.push(storage.update(storage.hydrator.hydrate(jsonData[contI])));
                                    }

                                    Promise.all(promises).then(function(values) {
                                        console.log(items[cont].replace('.json', ''), values);
                                    });
                                }
                            });
                        }
                    }
                });
            }
        };
    }
).set(
    'P2p',
    function (sm) {

        let p2p = new dsign.net.P2p(
            sm.get('Config').p2p.broadcasting,
            sm.get('Config').p2p.adapter,
            sm.get('Config').p2p.identifier
        );

        p2p.setSenderParser(new dsign.parse.ObjectToString());
        p2p.setReceiverParser(new dsign.parse.BufferToObject());

        return p2p;
}).set(
    'SoccerClient',
    function(sm){
        let config = sm.get('Config');

        return new dsign.net.HttpClient(config.soccerApi.path, config.soccerApi.headers)
    }
);

let test = serviceManager.get('P2p');
test.on(dsign.net.P2p.SERVER_MESSAGE, (m) => {console.log('EVENTO MESSAGGIO', m)});