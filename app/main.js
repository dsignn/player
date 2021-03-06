// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const fs = require('fs');
const url = require('url');
const path = require('path');
const MonitorContainerEntity = require('./module/monitor/src/entity/require/MonitorContainerEntity');
const MonitorEntity = require('./module/monitor/src/entity/require/MonitorEntity');
const PropertyHydrator = require('@dsign/library').hydrator.PropertyHydrator;
const HydratorStrategy = require('@dsign/library').hydrator.strategy.value.HydratorStrategy;
const NumberStrategy = require('@dsign/library').hydrator.strategy.value.NumberStrategy;
const Enviroment = process.env.APP_ENVIRONMENT ? process.env.APP_ENVIRONMENT.trim() : 'production';

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
     * @return {string}
     */
    static get PATH_MONITOR_FILE_CONFIG() {
        return path.join(__dirname, '/config/monitor-config.json');
    };

    /**
     * @param {Object} options
     */
    constructor(options) {

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
         * @type {Object}
         */
        this.config = JSON.parse(
            fs.readFileSync(
                this._getPathConfig(),
                {'encoding': 'UTF8'}
            )
        );

        this._loadMonitorsConfig();
        this._startScript();
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
     * @return {Application}
     * @private
     */
    _loadMonitorsConfig() {

        if (!fs.existsSync(Application.PATH_MONITOR_FILE_CONFIG)) {
            return;
        }

        let monitorsData = JSON.parse(fs.readFileSync(Application.PATH_MONITOR_FILE_CONFIG, {'encoding': 'UTF8'}));

        if (monitorsData && monitorsData.monitorConfig) {
            this.monitorsContainerEntity = this.getMonitorContainerEntityHydrator().hydrate(monitorsData.monitorConfig);
        }
        return this;
    }

    /**
     * @private
     */
    _startScript() {

        switch (true) {
            case this.config.storage !== undefined && this.config.storage.adapter !== undefined && this.config.storage.adapter.mongo !== undefined:

                if (this.environment === 'development') {
                    let dockerCompose = require('child_process').spawn('docker-compose', ['up', '-d']);
                    dockerCompose.stdout.on('data',(data) => {
                        console.log("start docker compose: ",data.toString('utf8'));
                    });
                } else {
                    console.warn('Star mongo service');
                }
        }
    }

    /**
     * @private
     */
    _stopScript() {


        switch (true) {
            case this.config.storage !== undefined && this.config.storage.adapter !== undefined && this.config.storage.adapter.mongo !== undefined:

                if (this.environment === 'development') {
                    let dockerCompose = require('child_process').spawn('docker-compose', ['stop']);
                    dockerCompose.stdout.on('data',(data) => {
                        console.log("stop docker compose: ",data.toString('utf8'));
                    });
                } else {
                    console.warn('stop mongo service');
                }
        }
    }

    /**
     * Create the browser window.
     * @private
     */
    createPlayerDashboard() {

        this.dashboard = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
                allowRunningInsecureContent: true,
                experimentalFeatures: true,
                enableRemoteModule: true
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

        if (this.environment === 'development') {
            this.dashboard.webContents.openDevTools({detached: true});
        }

        this.dashboard.loadFile(`${__dirname}${path.sep}${this._getDashboardEntryPoint()}`);

        /**
         * On close browser window
         */
        this.dashboard.on('closed', () => {
            this.dashboard = null
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
                enableRemoteModule: true
            },
            width: parseInt(monitor.width),
            height: parseInt(monitor.height),
            x: parseInt(monitor.offsetX),
            y: parseInt(monitor.offsetY),
            movable: false,
            resizable: false,
            frame: false,
            enableLargerThanScreen: true,
            hasShadow: false,
            // icon: path.join(__dirname, 'css/log/icon256x256.png'),
            title :  `Dsign Screen [${monitor.name.toUpperCase()}]`

        });

        browserWindows.setAlwaysOnTop(monitor.alwaysOnTop);

        browserWindows.webContents.on('did-finish-load', () => {
            // TODO delay for the fast load of the player index
            setTimeout(
                () => {
                    browserWindows.send('paper-player-config', this.getMonitorEntityHydrator().extract(monitor));
                },
                2000
            );
        });

        if (this.environment === 'development') {
            browserWindows.webContents.openDevTools({detached: true});
        }


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
     * @param monitorContainer
     */
    saveMonitorContainerConfig(monitorContainer) {
        fs.writeFile(
            Application.PATH_MONITOR_FILE_CONFIG,
            JSON.stringify({'monitorConfig' : monitorContainer}, null, 4),
            (err) =>  {
                if (err) {
                    console.error('Monitor config', err);
                    return;
                }
            }
        )
    }

    /**
     *
     */
    saveConfig() {
        fs.writeFile(
            this._getPathConfig(),
            JSON.stringify(this.config, null, 4),
            (err) => {
                if (err) {
                    console.error('Application config', err);
                    return;
                }
            }
        )
    }

    /**
     * @return {PropertyHydrator}
     */
    getMonitorContainerEntityHydrator() {

        if (this.monitorContainerEntityHydrator) {
            return this.monitorContainerEntityHydrator;
        }

        let monitorContainerEntityHydrator = new PropertyHydrator(
            new MonitorContainerEntity()
        );

        let strategy = new HydratorStrategy();
        strategy.setHydrator(this.getMonitorEntityHydrator());
        monitorContainerEntityHydrator.addValueStrategy('monitors', strategy);

        this.monitorContainerEntityHydrator = monitorContainerEntityHydrator;
        return this.monitorContainerEntityHydrator;
    }

    /**
     * @return {PropertyHydrator}
     */
    getMonitorEntityHydrator() {
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
        let monitors = this.monitorsContainerEntity.getMonitors();
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

        this.saveMonitorContainerConfig(monitorContainerData);
        application.closePlayerBrowserWindows();
        application.monitorsContainerEntity = application.getMonitorContainerEntityHydrator().hydrate(monitorContainerData);
        application.createPlayerBrowserWindows();
    }

    /**
     * @param object monitorContainerData
     */
    updatePlayerMonitors(monitorContainerData) {

        let newMonitorContainer = this.getMonitorContainerEntityHydrator().hydrate(monitorContainerData);
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
                    newMonitors[cont].browserWindows.send('paper-player-update', this.getMonitorEntityHydrator().extract(newMonitors[cont]));
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

        this.saveMonitorContainerConfig(monitorContainerData);
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

    /**
     * Close application
     */
    close() {
        this._stopScript();
    }
}

/**
 * @type {Application}
 */
const application = new Application({
        env: Enviroment
    }
);

/**
 * Enable autoplay tag video
 */
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

app.commandLine.appendSwitch('enable-native-gpu-memory-buffers', 'true');
app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode', 'true');
app.commandLine.appendSwitch('enable-gpu-rasterization', 'true');
app.commandLine.appendSwitch('enable-accelerated-video', 'true');
app.commandLine.appendSwitch('enable-zero-copy', 'true');
app.commandLine.appendSwitch('disable-software-rasterizer', 'true');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers', 'true');

/**
 * Electron ready
 */
app.on('ready', () => {
    application.run();
});

/**
 * Electron close all windows
 */
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q
    application.close();;
    if (process.platform !== 'darwin') {
        app.quit()
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
ipcMain.on('proxy', (event, message) => {

    if (!message.event || !message.data)  {
        let stringData = message.data !== null && typeof message.data === 'object' ? JSON.stringify(message.data) : 'not object';
        console.error(`Wrong message for proxy event ${message.event}: ${stringData}`);
        return;
    }

    switch (message.event) {
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
            application.saveConfig();
            break;
        default:
            application.broadcastMessage(message.event, message.data);
    }

});
