// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain, screen, globalShortcut} = require('electron');
const fs = require('fs');
const url = require('url');
const path = require('path')
const MonitorContainerEntity = require('./module/monitor/src/entity/require/MonitorContainerEntity');
const MonitorEntity = require('./module/monitor/src/entity/require/MonitorEntity');
const { PathNode } = require('@dsign/library/commonjs/path/PathNode');
const { Module } = require('@dsign/library/commonjs/core/module/Module');
const { AutoLoadClass } = require('@dsign/library/commonjs/core/autoload/AutoLoadClass');
const { WebComponent } = require('@dsign/library/commonjs/core/webcomponent');
const { Widget } = require('@dsign/library/commonjs/core/widget/Widget');
const PropertyHydrator = require('@dsign/library').hydrator.PropertyHydrator;
const HydratorStrategy = require('@dsign/library').hydrator.strategy.value.HydratorStrategy;
const NumberStrategy = require('@dsign/library').hydrator.strategy.value.NumberStrategy;
const FileSystemAdapter = require('@dsign/library').storage.adapter.fileSystem.FileSystemAdapter;
const Storage = require('@dsign/library').storage.Storage;
const Utils = require('@dsign/library').core.Utils;
const Enviroment = process.env.APP_ENVIRONMENT ? process.env.APP_ENVIRONMENT.trim() : 'production';
const homeData = Utils.getHomeDir(process.env, process.env.APP_ENVIRONMENT == 'development' ? 'dsign-player-development' : 'dsign-player');

/**
 * @returns {StorageInterface}
 */
var loadStorageService = () => {
    let fileSystem = new FileSystemAdapter(path.normalize(`${homeData}/config`), 'application');
    fileSystem.setIdentifier('id');

    let storage = new Storage(fileSystem);

    storage.setHydrator(Application.getConfigHydrator());

    return storage;
}


/**
 * GLobal setting eletron
 */
if (Enviroment === 'development') {
   // app.commandLine.appendSwitch('--show-fps-counter');
}

/**
 * @type Application
 */
class Application {

    /**
     * @param {Object} options
     * @param {StorageInterface} configStorage
     */
    constructor(options, configStorage) {

        /**
         * @type {module:child_process}
         */
        this.api = null;

        /**
         * @type BrowserWindow
         */
        this.dashboard = null;

        /**
         * @type {String}
         */
        this.environment = options.env ? options.env : 'production';

        /**
         * @type {MonitorContainerEntity}
         */
        this.monitorsContainerEntity = new MonitorContainerEntity();

        /**
         * @type {StorageInterface}
         */
        this.configStorage = configStorage;


        this._loadConfig()
            .then((config) => {
                console.log('[Dsign-dbug]', 'Load config');
            });

        app.whenReady().then(() => {
            this.displays = screen.getAllDisplays();
            this.loadShortcut();
        });

        this.dashboardDevToolsOpen = false;

        this.playerDevToolsOpen = false;
    }

    /**
     * @private
     */
    async _loadConfig() {
   
        let configMoved = await this.configStorage.get('application');
        if (!configMoved && !configMoved.id) {
            try {
                this.config = JSON.parse(fs.readFileSync(this._getPathConfig(), {'encoding': 'UTF8'}));
                this.config.id = 'application';
                let savedConfig = await this.configStorage.save();
            } catch (err) {
                console.warn('Error load file config', err);
                this.config = {};
            }
        } else {
            this.config = configMoved;
        }

        if(this.config && this.config.enableMonitor && this.config.enableMonitor.id) {

            this.monitorsContainerEntity = this.config.enableMonitor;
        }

        if (this.config.enableFetures) {
            Object.entries(this.config.enableFetures).forEach(([key, value]) => {
                app.commandLine.appendSwitch(key, value);
            });
        }

        return this.config;
    }

    /**
     * @return {string}
     * @private
     */
    _getPathConfig() {
        return path.join(__dirname, 'config', `config-${this.environment}.json`);
    }

    /**
     * @return {string}
     * @private
     */
    _getDashboardEntryPoint() {
        return `${this.environment === 'development' ?  'development' : 'entrypoint'}/dashboard/index.html`
    }

    /**
     * @return {string}
     * @private
     */
    _getPlayerEntryPoint() {
        return `${this.environment === 'development' ?  'development' : 'entrypoint'}/player/index.html`
    }

    /**
     * Create the browser window.
     * @private
     */
    createPlayerDashboard() {

        this.dashboard = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                experimentalFeatures: true,
            },
            titleBarStyle: 'hidden',
            autoHideMenuBar: true,
            icon: path.join(__dirname, 'images/android-chrome-384x384.png'),
            title: `Dsign dashboard`,
            width: 600,
            height: 800,
            minHeight: 500,
            minWidth: 600,
            useContentWidth: true
        });

        this.dashboard.loadFile(`${__dirname}${path.sep}${this._getDashboardEntryPoint()}`);

        /**
         * On close browser window
         */
        this.dashboard.on('closed', () => {
            this.dashboard = null;
            app.quit();
        });
    }

    /**
     * @param {MonitorEntity} monitor
     * @returns {BrowserWindow}
     */
    createWindowPlayer(monitor) {

        let browserWindows = new BrowserWindow({
            webPreferences : {
                nodeIntegration: true,
                contextIsolation: false,
                enableRemoteModule: true,
                preload: __dirname + '/entrypoint/player/src/preload.js'
            },
            width: parseInt(monitor.width),
            height: parseInt(monitor.height),
            x: parseInt(monitor.offsetX),
            y: parseInt(monitor.offsetY),
            movable: false,
            resizable: false,
            frame: false,
            transparent: true,
            enableLargerThanScreen: true,
            hasShadow: false,
            title :  `Dsign Screen [${monitor.name.toUpperCase()}]`

        });

        browserWindows.setAlwaysOnTop(monitor.alwaysOnTop);

        browserWindows.webContents.on('did-finish-load', () => {
            // TODO IMPLEMENT FLOW TO LOAD DATA
            setTimeout(
                () => {
                    browserWindows.send('monitor-id', monitor.getId());
                },
                5000
            );  
        });

        browserWindows.loadFile(`${__dirname}${path.sep}${this._getPlayerEntryPoint()}`);

        return browserWindows;
    }

    /**
     *
     */
    createGpuWindows() {

        this.gpuWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                allowRunningInsecureContent: false,
                experimentalFeatures: true,
            },
            titleBarStyle: 'hidden',
            autoHideMenuBar: true,
            title: `Dsign gpu`,
            width: 600,
            height: 1200,
            useContentWidth: true
        });

        this.gpuWindow.loadURL(`chrome://gpu`);

        /**
         * On close browser window
         */
        this.gpuWindow.on('closed', () => {
            this.dashboard.send('paper-gpu-close');
            this.gpuWindow = null
        });
    }

    /**
     * @returns {HydrationInterface}
     */
    static getConfigHydrator() {
        let pathHydrator = new PropertyHydrator(new PathNode());
        let moduleHydrator = new PropertyHydrator(new Module());
        
        let webComponentHydrator = new PropertyHydrator(new WebComponent());
        webComponentHydrator.addValueStrategy('path', new HydratorStrategy(pathHydrator));
        
        let autoLoadClassHydrator = new PropertyHydrator(new AutoLoadClass());
        autoLoadClassHydrator.addValueStrategy('path', new HydratorStrategy(pathHydrator));
    
        moduleHydrator.addValueStrategy('autoloadsWc', new HydratorStrategy(webComponentHydrator));
        moduleHydrator.addValueStrategy('entryPoint', new HydratorStrategy(webComponentHydrator));
        moduleHydrator.addValueStrategy('autoloads', new HydratorStrategy(autoLoadClassHydrator));
    
        let widgetHydrator = new PropertyHydrator(new Widget());
        widgetHydrator.addValueStrategy('webComponent', new HydratorStrategy(webComponentHydrator));
        widgetHydrator.addValueStrategy('webComponentData', new HydratorStrategy(webComponentHydrator));
    
        moduleHydrator.addValueStrategy('widgets', new HydratorStrategy(widgetHydrator));

        let configHydrator = new PropertyHydrator();
        configHydrator.addValueStrategy('module', new HydratorStrategy(moduleHydrator));
        configHydrator.addValueStrategy('enableMonitor', new HydratorStrategy(Application.getMonitorContainerEntityHydrator()));

        return configHydrator;
    }

    static relaunch() {
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
        app.exit(0); 
    }

    loadShortcut() {
        
        globalShortcut.register('Alt+Control+1', () => {
            this.dashboard.webContents.openDevTools({detached: true});
        });

        globalShortcut.register('Alt+Control+2', () => {

            let monitors = this.monitorsContainerEntity.getMonitors();
            for (let cont = 0; monitors.length > cont; cont++) {

                if (monitors[cont].browserWindows) {
                    monitors[cont].browserWindows.webContents.openDevTools({detached: true});
                }
            }
        });

        globalShortcut.register('Alt+Control+3', () => {
            Application.relaunch();
        });
    }

    /**
     * @return {PropertyHydrator}
     */
    static getMonitorContainerEntityHydrator() {

        if (this.monitorContainerEntityHydrator) {
            return this.monitorContainerEntityHydrator;
        }

        let monitorContainerEntityHydrator = new PropertyHydrator(
            new MonitorContainerEntity()
        );

        let strategy = new HydratorStrategy();
        strategy.setHydrator(Application.getMonitorEntityHydrator());
        monitorContainerEntityHydrator.addValueStrategy('monitors', strategy);

        this.monitorContainerEntityHydrator = monitorContainerEntityHydrator;
        return this.monitorContainerEntityHydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    static getMonitorEntityHydrator() {
        if (this.monitorEntityHydrator) {
            return this.monitorEntityHydrator;
        }

        let monitorEntityHydrator =  new PropertyHydrator(
            new MonitorEntity()
        );

        let strategy = new HydratorStrategy();
        strategy.setHydrator(monitorEntityHydrator);
        monitorEntityHydrator.addValueStrategy(
            'monitors',
            strategy
        );

        monitorEntityHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('backgroundColor')
            .enableExtractProperty('polygonPoints')
            .enableExtractProperty('monitors')
            .enableExtractProperty('alwaysOnTop')
            .enableExtractProperty('defaultTimeslotReference');

        monitorEntityHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('backgroundColor')
            .enableHydrateProperty('polygonPoints')
            .enableHydrateProperty('monitors')
            .enableHydrateProperty('alwaysOnTop')
            .enableHydrateProperty('defaultTimeslotReference');

        monitorEntityHydrator.addValueStrategy('width', new NumberStrategy())
            .addValueStrategy('height', new NumberStrategy())
            .addValueStrategy('offsetX', new NumberStrategy())
            .addValueStrategy('offsetY', new NumberStrategy());


        this.monitorEntityHydrator = monitorEntityHydrator;

        return this.monitorEntityHydrator;
    }

    /**
     * @return {Application}
     */
    closePlayerBrowserWindows() {

        let monitors = this.monitorsContainerEntity.getMonitors();
        for (let cont = 0; monitors.length > cont; cont++) {

            if (monitors[cont].browserWindows) {
                monitors[cont].browserWindows.close();
            }
        }

        this.monitorsContainerEntity.clearMonitors();
        return this;
    }

    /**
     * TODO
     */
    createApi() {

        let express = require('express');
        this.api = express();

        this.api.get('/timeslot', (req, res) => res.send('Hello World!'));

        this.api.listen(3001 , () => console.log(`Example app listening on port ${3001}!`, this.api ));
        let mainWindow = new BrowserWindow({
            width: 0,
            height: 0,
            autoHideMenuBar: true,
            useContentSize: true,
            resizable: false,
        });
        mainWindow.loadURL('http://localhost:3001/');
        mainWindow.focus();
        mainWindow.hide();
    }

    /**
     * @return {Application}
     */
    createPlayerBrowserWindows() {
        this.dashboard.send('loading-player-windows', {});
        let monitors = this.monitorsContainerEntity.getMonitors();
        this.loadingCount = monitors.length;
        if (monitors.length > 0) {
            for (let cont = 0; monitors.length > cont; cont++) {
                monitors[cont].browserWindows = this.createWindowPlayer(monitors[cont]);
            }
        }
        return this;
    }

    /**
     * @param object monitorContainerData
     */
    changePlayerMonitors(monitorContainerData) {
        this.config.enableMonitor = Application.getMonitorContainerEntityHydrator().hydrate(monitorContainerData);
        this.configStorage.update(this.config)
            .then((data) => {

                application.closePlayerBrowserWindows();   
                application.monitorsContainerEntity = this.config.enableMonitor;  
                application.createPlayerBrowserWindows();
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * @param object monitorContainerData
     */
    updatePlayerMonitors(monitorContainerData) {

        let newMonitorContainer = Application.getMonitorContainerEntityHydrator().hydrate(monitorContainerData);
        let newMonitors = newMonitorContainer.getMonitors();
        let index;

        let oldMonitors = this.monitorsContainerEntity.getMonitors();

        for (let cont = 0; this.monitorsContainerEntity.monitors.length > cont; cont++) {
            this.monitorsContainerEntity.monitors[cont].remove = true;
        }


        /**
         * Update o add monitor
         */
        for (let cont = 0; newMonitors.length > cont; cont++) {

            index = oldMonitors.findIndex((element) => {
                return element.id === newMonitors[cont].id;
            });

            switch (true) {
                case index > -1:

                    newMonitors[cont].browserWindows = this.monitorsContainerEntity.monitors[index].browserWindows;

                    newMonitors[cont].browserWindows.setAlwaysOnTop(newMonitors[cont].alwaysOnTop);
                    newMonitors[cont].browserWindows.setPosition(
                        newMonitors[cont].offsetX,
                        newMonitors[cont].offsetY
                    );

                    newMonitors[cont].browserWindows.setSize(
                        newMonitors[cont].width,
                        newMonitors[cont].height
                    );
                    newMonitors[cont].browserWindows.send('paper-player-update', Application.getMonitorEntityHydrator().extract(newMonitors[cont]));
                    this.monitorsContainerEntity.monitors[index] = newMonitors[cont];
                    break;
                default:

                    newMonitors[cont].browserWindows = this.createWindowPlayer(newMonitors[cont]);
                    this.monitorsContainerEntity.addMonitor(newMonitors[cont]);
                    break;
            }
        }

        /**
         * Remove monitor
         */
        for (let cont = 0; this.monitorsContainerEntity.monitors.length > cont; cont++) {

            if (!this.monitorsContainerEntity.monitors[cont].remove) {
                continue;
            }

            if (this.monitorsContainerEntity.monitors[cont].browserWindows) {
                this.monitorsContainerEntity.monitors[cont].browserWindows.close();
            }
            this.monitorsContainerEntity.removeMonitor(this.monitorsContainerEntity.monitors[cont]);
        }

        
        this.config.enableMonitor = newMonitorContainer;
        this.configStorage.update(this.config)
            .then((data) => {

                application.monitorsContainerEntity = this.config.enableMonitor;
            })
            .catch((err) => {
                console.error(err);
            });
    }

    /**
     * @param {string} type
     * @param {Object} message
     */
    broadcastMessage(type, message) {
        let monitors = this.monitorsContainerEntity.getMonitors();
        for (let cont = 0; monitors.length > cont; cont++) {
            monitors[cont].browserWindows.send(type, message);
        }
    }

    /**
     * Run application
     */
    run() {
        this.createPlayerDashboard();
        this.createPlayerBrowserWindows();
    }
}


const storage = loadStorageService();
let options = {
    env: Enviroment
}
/**
 * @type {Application}
 */
const application = new Application(options, storage);

const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
     console.warn('Try to start second instance');
     app.quit()
} else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        // Someone tried to run a second instance, we should focus our window.
        if (application.dashboard.BrowserWindow) {
            if (application.dashboard.BrowserWindow.isMinimized()) {
                application.dashboard.BrowserWindow.restore();  
            } 
            application.dashboard.BrowserWindow.focus()
        }
    })
    /**
     * Electron ready
     */
    app.on('ready', () => {
        application.run();
    });
}
    


/**
 * Electron close all windows
 */
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (application.dashboard === null) {
        application.run();
    }
});

/**
 * Ipc comunication
 */
 ipcMain.on('require-monitor-config', (event, message) => { 

    if (!application.monitorsContainerEntity) {
        console.log('no monitorsContainerEntity set', message);
        return;
    }

    let monitors = application.monitorsContainerEntity.getMonitors();

    if (monitors.length > 0) {
        for (let cont = 0; monitors.length > cont; cont++) {

            if( monitors[cont].getId() === message) {
                monitors[cont].browserWindows.send('paper-player-config', Application.getMonitorEntityHydrator().extract(monitors[cont]));
                application.loadingCount--;
                if (application.loadingCount == 0) {
                    application.dashboard.send('loading-player-windows-finish', {});
                }
                break;
            }
        }
    }
 });

/**
 * Ipc comunication
 */
ipcMain.on('proxy', (event, message) => {

    if (!message.event || !message.data)  {
        let stringData = message.data !== null && typeof message.data === 'object' ? JSON.stringify(message.data) : 'not object';
        console.error(`Wrong message for proxy event ${message.event}: ${stringData}`);
        return;
    }

    switch (message.event) {
        case 'paper-player-disable':
            application.closePlayerBrowserWindows(); 
            application.config.enableMonitor = new MonitorContainerEntity();  
            application.monitorsContainerEntity = application.config.enableMonitor;
            application.configStorage.update(application.config);
            break;
        case 'paper-player-change':
            application.changePlayerMonitors(message.data);
            break;
        case 'paper-player-update':
            application.updatePlayerMonitors(message.data);
            break;
        case 'paper-gpu-open':
            application.createGpuWindows();
            break;
        case 'dashboard-always-on-top':
            application.config.dashboard = {alwaysOnTop : message.data};
            application.dashboard.setAlwaysOnTop(message.data.checked);
            application.configStorage.save(application.config);
            break;
        case 'monitors':
            event.reply('monitors', application.displays);
            break;
        case 'relaunch':
            Application.relaunch();
            break;
        default:
            application.broadcastMessage(message.event, message.data);
    }
});
