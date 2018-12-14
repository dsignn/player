const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron')
const fs    = require('fs');
const url   = require('url');
const path  = require('path');
const Monitor = require('./plugin/monitor/src/model/Monitor');
const VirtualMonitor = require('./plugin/monitor/src/model/VirtualMonitor');
const PropertyHydrator = require('./lib/hydrator/PropertyHydrator');
const HydratorStrategy = require('./lib/hydrator/strategy/HydratorStrategy');
const NumberStrategy = require('./lib/hydrator/strategy/NumberStrategy');
const HydratorManager = require('./lib/hydrator/pluginManager/HydratorPluginManager');

class App {

    /**
     * @return {string}
     */
    static get PATH_MONITOR_FILE_CONFIG() {
        return path.join(__dirname, '/config/monitor-config.json');
    };

    /**
     * @return {string}
     */
    static get PATH_APP_FILE_CONFIG() {
        return path.join(__dirname, '/config/application.json');
    };

    /**
     *
     */
    constructor() {

        /**
         * @type {BrowserWindow|null}
         */
        this.dashboard = null;

        /**
         * @type {VirtualMonitor}
         */
        this.monitorsWrapper = new VirtualMonitor();

        /**
         * @type {Object}
         */
        this.config = JSON.parse(
            fs.readFileSync(App.PATH_APP_FILE_CONFIG, {'encoding': 'UTF8'})
        );

        /**
         * Inject hydratorManager
         */
        this._injectHydratorManager();

        /**
         * Laod Last monitors config
         */
        this._loadMonitorsConfig();
    }

    /**
     * @param {Object} data
     * @return {App}
     */
    setMonitorWrapperFromObject(data) {
        this.monitorsWrapper = this.hydratorManager.get('virtualHydrator').hydrate(data);
        return this;
    }

    /**
     * @return {VirtualMonitor}
     */
    getMonitorWrapper() {
        return this.monitorsWrapper;
    }

    /**
     * @return {BrowserWindow}
     */
    getDashboard() {
        return this.dashboard;
    }

    /**
     * @return {App}
     */
    createWindowDashboard() {
        // App
        this.dashboard = new BrowserWindow({
            width: 1170,
            height: 800,
            titleBarStyle: 'hidden',
            x: 2400,
            y: 200,
            autoHideMenuBar: true,
            icon: path.join(__dirname, '../build/icon256x256.png'),
            title : `Dsign Dashboard`
        });

        this.dashboard.loadURL(url.format({
            pathname: path.join(__dirname, '/dashboard.html'),
            protocol: 'file:',
            slashes: true
        }));

        // Emitted when the window is closed.
        this.dashboard.on('closed', () => {
            this.dashboard = null
        });

        return this;
    }

    /**
     * @param {Monitor} monitor
     * @returns {BrowserWindow}
     */
    createWindowPlayer(monitor) {

        let browserWindows = new BrowserWindow({
            width: parseInt(monitor.width),
            height: parseInt(monitor.height),
            x: parseInt(monitor.offsetX),
            y: parseInt(monitor.offsetY),
            movable: true,
            resizable: false,
            frame: false,
            enableLargerThanScreen: true,
            hasShadow: false,
            icon: path.join(__dirname, '../build/icon256x256.png'),
            title :  `Dsign Screen [${monitor.name.toUpperCase()}]`

        });

        browserWindows.webContents.on('did-finish-load', () => {
            browserWindows.send('player-monitor-config', monitor);
        });

        if (this.config && this.config.debug === true) {
            browserWindows.webContents.openDevTools({detached: true});
        }

        browserWindows.loadURL(url.format({
            pathname: path.join(__dirname, '/player.html'),
            protocol: 'file:',
            slashes: true
        }));

        return browserWindows;
    }

    /**
     * @return {App}
     */
    createWindowsPlayer() {
        let monitors = this.monitorsWrapper.getMonitors();
        if (monitors.length > 0) {
            for (let cont = 0; monitors.length > cont; cont++) {
                monitors[cont].browserWindows = this.createWindowPlayer(monitors[cont]);
            }
        }
        return this;
    }

    /**
     * @return {App}
     */
    closeWindowsPlayer() {

        let monitors = this.monitorsWrapper.getMonitors();
        for (let cont = 0; monitors.length > cont; cont++) {
            monitors[cont].browserWindows.close();
        }

        this.monitorsWrapper.clearMonitors();
        return this;
    }

    /**
     * @return {App}
     * @private
     */
    _loadMonitorsConfig() {

        if (!fs.existsSync(App.PATH_MONITOR_FILE_CONFIG)) {
            return;
        }

        let monitorsData = JSON.parse(fs.readFileSync(App.PATH_MONITOR_FILE_CONFIG, {'encoding': 'UTF8'}));

        if (monitorsData && monitorsData.monitorConfig) {
            this.setMonitorWrapperFromObject(monitorsData.monitorConfig);
        }
        return this;
    }

    /**
     * @private
     */
    _injectHydratorManager() {
        this.hydratorManager = new HydratorManager();

        let monitorHydrator = new PropertyHydrator(
            new Monitor(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                offsetX: new NumberStrategy(),
                offsetY: new NumberStrategy()
            }
        );

        monitorHydrator.addStrategy(
            'monitors',
            new HydratorStrategy(monitorHydrator)
        );

        let virtualHydrator = new PropertyHydrator(
            new VirtualMonitor(),
            {
                'monitors' :  new HydratorStrategy(monitorHydrator)
            }
        );

        this.hydratorManager.set('virtualHydrator', virtualHydrator)
            .set('monitorHydrator', monitorHydrator);
    }

    /**
     * @return {App}
     */
    loadGlobalShortcut() {

        /**
         * dashboard Atop Enable
         */
        globalShortcut.register('Control+A+E', () => {
            console.log('ENABLE-----');
            application.getDashboard().setAlwaysOnTop(true);
            application.getDashboard().send('enable-atop', {context : 'dashboard'});
        });

        /**
         *  dashboard Atop Disable
         */
        globalShortcut.register('Control+A+D', () => {
            console.log('DISABLE----');
            application.getDashboard().setAlwaysOnTop(false);
            application.getDashboard().send('disable-atop', {context : 'dashboard'});
        });

        return this;
    }

    /**
     * Run application
     */
    run() {

        this.createWindowDashboard();
        this.createWindowsPlayer();
        this.loadGlobalShortcut();
    }
}


let application = new App();

/**
 * Enable autoplay tag video
 */
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

/**
 * Run application
 */
app.on('ready', () => {
    application.run();
});

/**
 * Quit when all windows are closed.
 */
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar to stay active until
    // the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

/***********************************************************************************************************************
                                               IPC EVENT MESSAGE
***********************************************************************************************************************/
/**
 * New default configuration monitor
 */
ipcMain.on('change-monitors-configuration', (event, message) => {

    fs.writeFile(
        App.PATH_MONITOR_FILE_CONFIG,
        JSON.stringify({'monitorConfig' : message}, null, 4),
        function(err) {
            if(err) {
                return console.log("ReloadMonitor save error: " + err);
            }

            application.closeWindowsPlayer();
            application.setMonitorWrapperFromObject(message);
            application.createWindowsPlayer();
        }
    );
});

/**
 * Modifica della configurazione abilitata
 */
ipcMain.on('update-enable-monitor-configuration', (event, message) => {

    if (message.monitors && Array.isArray(message.monitors) && message.monitors.length > 0) {

        fs.writeFile(
            App.PATH_MONITOR_FILE_CONFIG,
            JSON.stringify({'monitorConfig' : message}, null, 4),
            function(err) {
                if(err) {
                    return console.log("UpdateMonitor save error: " + err);
                }

                let virtualMonitor = application.hydratorManager.get('virtualHydrator').hydrate(message);
                let monitorsWrapper = application.getMonitorWrapper();

                for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
                    monitorsWrapper.monitors[cont].remove = true;
                }

                for (let cont = 0; virtualMonitor.monitors.length > cont; cont++) {

                    let currentMonitor = monitorsWrapper.getMonitor(virtualMonitor.monitors[cont].id);

                    switch (true) {
                        case currentMonitor === undefined :
                            virtualMonitor.monitors[cont].browserWindows = application.createWindowPlayer(virtualMonitor.monitors[cont]);
                            monitorsWrapper.pushMonitor(virtualMonitor.monitors[cont]);
                            break;

                        case typeof currentMonitor === 'object' && currentMonitor !== null:
                            currentMonitor.browserWindows.setPosition(
                                virtualMonitor.monitors[cont].offsetX,
                                virtualMonitor.monitors[cont].offsetY
                            );

                            currentMonitor.browserWindows.setSize(
                                virtualMonitor.monitors[cont].width,
                                virtualMonitor.monitors[cont].height
                            );

                            currentMonitor.remove = false;
                            currentMonitor.browserWindows.send('player-monitor-update', virtualMonitor.monitors[cont]);
                            break;
                    }
                }

                for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
                    if (monitorsWrapper.monitors[cont].remove === true) {
                        monitorsWrapper.monitors[cont].browserWindows.close();
                        monitorsWrapper.removeMonitor(monitorsWrapper.monitors[cont]);
                    }
                }
            }
        );
    }
});


ipcMain.on('play-timeslot', (event, message) => {

    let monitorsWrapper = application.getMonitorWrapper();
    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getFirstChildFromId(message.timeslot.virtualMonitorReference.monitorId)
                    .browserWindows
                    .send('play-timeslot', message);
            } else {
                // TODO write lo log
                console.error('Error not found');
            }
            break;
        default:
        // TODO broadcast on other application on comunication each other
    }
});

ipcMain.on('stop-timeslot', (event, message) => {

    let monitorsWrapper = application.getMonitorWrapper();
    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getFirstChildFromId(message.timeslot.virtualMonitorReference.monitorId)
                    .browserWindows
                    .send('stop-timeslot', message);
            } else {
                // TODO write lo log
                console.error('Error not found');
            }
            break;
        default:
        // TODO broadcast on other application on comunication each other
    }
});

ipcMain.on('pause-timeslot', (event, message) => {

    let monitorsWrapper = application.getMonitorWrapper();
    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getFirstChildFromId(message.timeslot.virtualMonitorReference.monitorId)
                    .browserWindows
                    .send('pause-timeslot', message);
            } else {
                // TODO write lo log
                console.error('Error not found');
            }
            break;
        default:
        // TODO broadcast on other application on comunication each other
    }
});

ipcMain.on('resume-timeslot', (event, message) => {

    let monitorsWrapper = application.getMonitorWrapper();
    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getFirstChildFromId(message.timeslot.virtualMonitorReference.monitorId)
                    .browserWindows
                    .send('resume-timeslot', message);
            } else {
                // TODO write lo log
                console.error('Error not found');
            }
            break;
        default:
        // TODO broadcast on other application on comunication each other
    }
});

/**
 * Proxy the message to all monitor open
 */
ipcMain.on('proxy', (event, message) => {

    if (!message.nameMessage || !message.data)  {
        console.error('Wrong message for proxy event');
        return;
    }

    let monitorsWrapper = application.getMonitorWrapper();
    if (!monitorsWrapper || !monitorsWrapper.monitors || !Array.isArray(monitorsWrapper.monitors)) {
        return;
    }

    for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
        monitorsWrapper.monitors[cont].browserWindows.send(message.nameMessage, message.data);
    }
});


/**
 * enable atop
 */
ipcMain.on('enable-atop', (event, message) => {

});