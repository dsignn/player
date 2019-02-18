const {app, BrowserWindow, globalShortcut, ipcMain} = require('electron');
const fs    = require('fs');
const url   = require('url');
const path  = require('path');
const Monitor = require('./module/monitor/src/model/Monitor');
const VirtualMonitor = require('./module/monitor/src/model/VirtualMonitor');
const PropertyHydrator = require('dsign-library').hydrator.PropertyHydrator;
const HydratorStrategy = require('dsign-library').hydrator.strategy.HydratorStrategy;
const NumberStrategy = require('dsign-library').hydrator.strategy.NumberStrategy;
const HydratorManager = require('dsign-library').hydrator.HydratorPluginManager;

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
     * @param {boolean} status
     * @return {App}
     */
    setDashboardAlwaysOnTop(status) {
        this.dashboard.setAlwaysOnTop(status);
        this.config.dashboard.alwaysOnTop = status;
        this._saveConfigSettings();
        return this;
    }

    /**
     * @param {boolean} status
     * @param {string} id
     */
    setMonitorAlwaysOnTop(status, id) {
        let monitor = this.monitorsWrapper.getMonitor(id);

        if(!monitor) {
            return;
        }

        monitor.browserWindows.setAlwaysOnTop(status);
        monitor.alwaysOnTop = status;
        this._saveMonitorsSettings();
        return this;
    }

    /**
     * @private
     */
    _saveConfigSettings() {
        fs.writeFile(
            App.PATH_APP_FILE_CONFIG,
            JSON.stringify(this.config, null, 4),
            function(err) {
                if(err) {
                    console.error("Save config error: " + err);
                    return;
                }
            }
        );
    }

    /**
     * @return {PropertyHydrator}
     * @private
     */
    static getMonitoHydrator() {
        let monitorHydrator = new PropertyHydrator(
            new Monitor(),
            {
                width: new NumberStrategy(),
                height: new NumberStrategy(),
                offsetX: new NumberStrategy(),
                offsetY: new NumberStrategy()
            }
        );

        monitorHydrator.enableExtractProperty('id')
            .enableExtractProperty('name')
            .enableExtractProperty('offsetX')
            .enableExtractProperty('offsetY')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('backgroundColor')
            .enableExtractProperty('polygon')
            .enableExtractProperty('monitors')
            .enableExtractProperty('defaultTimeslotId');

        monitorHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('name')
            .enableHydrateProperty('offsetX')
            .enableHydrateProperty('offsetY')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('backgroundColor')
            .enableHydrateProperty('polygon')
            .enableHydrateProperty('monitors')
            .enableHydrateProperty('defaultTimeslotId');

        return monitorHydrator;
    }

    /**
     * @private
     */
    _saveMonitorsSettings() {
        let data = this.hydratorManager.get('virtualHydrator').extract(this.monitorsWrapper);
        fs.writeFile(
            App.PATH_MONITOR_FILE_CONFIG,
            JSON.stringify({'monitorConfig' : data}, null, 4),
            function(err) {
                if(err) {
                    console.error("Save monitor error: " + err);
                    return;
                }
            }
        );
    }

    /**
     * @return {App}
     */
    createWindowDashboard() {
        // App
        this.dashboard = new BrowserWindow({
            webPreferences : {
                nodeIntegration: true,
            },
            width: 1170,
            height: 800,
            titleBarStyle: 'hidden',
            x: 2400,
            y: 200,
            autoHideMenuBar: true,
            icon: path.join(__dirname, '../build/icon256x256.png'),
            title : `Dsign Dashboard`
        });

        this.dashboard.setAlwaysOnTop(this.config.dashboard.alwaysOnTop);

        this.dashboard.loadURL(url.format({
            pathname: path.join(__dirname, '/dashboard.html'),
            protocol: 'file:',
            slashes: true
        }));

        if (this.config && this.config.debug === true) {
            this.dashboard.openDevTools({detached: true});
        }

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
            webPreferences : {
                nodeIntegration: true,
            },
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

        browserWindows.setAlwaysOnTop(monitor.alwaysOnTop);

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

        let monitorHydrator = App.getMonitoHydrator();

        monitorHydrator.enableExtractProperty('alwaysOnTop');
        monitorHydrator.enableHydrateProperty('alwaysOnTop');

        monitorHydrator.addStrategy(
            'monitors',
            new HydratorStrategy(App.getMonitoHydrator())
        );

        this.hydratorManager.set(
            'monitorHydrator',
            monitorHydrator
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
            application.setDashboardAlwaysOnTop(true);
            application.getDashboard().send('enable-always-on-top', {context : 'dashboard'});
        });

        /**
         *  dashboard Atop Disable
         */
        globalShortcut.register('Control+A+D', () => {
            application.setDashboardAlwaysOnTop(false);
            application.getDashboard().send('disable-always-on-top', {context : 'dashboard'});
        });

        /**
         *  Screen Atop Disable
         */
        globalShortcut.register('Control+Alt+I', () => {
            this.dashboard.openDevTools({detached: true});
            let monitors = application.getMonitorWrapper().getMonitors();
            for (let cont = 0; monitors.length > cont; cont++) {
                monitors[cont].browserWindows.openDevTools({detached: true});
            }
        });

        globalShortcut.register('Alt+A+E', () => {
            let monitors = application.getMonitorWrapper().getMonitors();
            for (let cont = 0; monitors.length > cont; cont++) {
                application.setMonitorAlwaysOnTop(true, monitors[cont].id);
                application.getDashboard().send('enable-always-on-top', {context : 'monitor', monitorId : monitors[cont].id});
            }
        });

        /**
         *  Screen Atop Disable
         */
        globalShortcut.register('Alt+A+D', () => {
            let monitors = application.getMonitorWrapper().getMonitors();
            for (let cont = 0; monitors.length > cont; cont++) {
                application.setMonitorAlwaysOnTop(false, monitors[cont].id);
                application.getDashboard().send('disable-always-on-top', {context : 'monitor', monitorId : monitors[cont].id});
            }
        });

        return this;
    }

    /**
     * @param {string} type
     * @param {Object} message
     */
    broadcastMessage(type, message) {
        let monitors = this.monitorsWrapper.getMonitors();
        for (let cont = 0; monitors.length > cont; cont++) {
            monitors[cont].browserWindows.send(type, message);
        }
    }

    /**
     * @param {string} type
     * @param {Object} message
     * @param {Timeslot} timeslot
     */
    sendMessage(type, message, timeslot) {
        if (!timeslot.virtualMonitorReference || timeslot.virtualMonitorReference.virtualMonitorId !== this.monitorsWrapper.id) {
            console.warn('Try to send a timeslot on virtual monitor not active');
            return;
        }

        if (this.monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
            this.monitorsWrapper.getFirstChildFromId(message.timeslot.virtualMonitorReference.monitorId)
                .browserWindows
                .send(type, message);
        } else {
            console.error(`Monitor id ${message.timeslot.virtualMonitorReference.monitorId} not found`);
        }
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
ipcMain.on('change-virtual-monitor', (event, message) => {

    fs.writeFile(
        App.PATH_MONITOR_FILE_CONFIG,
        JSON.stringify({'monitorConfig' : message}, null, 4),
        function(err) {
            if(err) {
                return console.error("ReloadMonitor save error: " + err);
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
ipcMain.on('update-virtual-monitor', (event, message) => {

    if (message.monitors && Array.isArray(message.monitors) && message.monitors.length > 0) {

        fs.writeFile(
            App.PATH_MONITOR_FILE_CONFIG,
            JSON.stringify({'monitorConfig' : message}, null, 4),
            function(err) {
                if(err) {
                    return console.error("UpdateMonitor save error: " + err);
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
                            currentMonitor.browserWindows.send('update-virtual-monitor', virtualMonitor.monitors[cont]);
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

/**
 * Stop timeslot
 */
ipcMain.on('stop-timeslot', (event, message) => {
    /**
     * Stop timeslot
     */
    switch (true) {
        case message.timeslot === undefined:
            application.broadcastMessage('stop-timeslot', message);
            break;
        case message.timeslot !== undefined:
            application.sendMessage('stop-timeslot', message, message.timeslot);
            break;
    }
});

ipcMain.on('pause-timeslot', (event, message) => {
    /**
     * Pause timeslot
     */
    switch (true) {
        case message.timeslot === undefined:
            application.broadcastMessage('pause-timeslot', message);
            break;
        case message.timeslot !== undefined:
            application.sendMessage('pause-timeslot', message, message.timeslot);
            break;
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
ipcMain.on('toggle-always-on-top', (event, message) => {

    switch (message.context) {
        case 'dashboard' :
            application.setDashboardAlwaysOnTop(message.status === 'enable' ? true : false);
            break;
        case 'monitor' :
            application.setMonitorAlwaysOnTop(message.status === 'enable' ? true : false, message.monitorId);
            break;
    }
});