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

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let config;
let monitorsWrapper = null;
let hydratorManager = new HydratorManager();

let monitorHydrator = new PropertyHydrator(
    new Monitor(),
    {
        width: new NumberStrategy(),
        height: new NumberStrategy(),
        offsetX: new NumberStrategy(),
        offsetY: new NumberStrategy()
    }
);

/**
 * Enable autoplay
 */
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

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


hydratorManager.set('virtualHydrator', virtualHydrator)
    .set('monitorHydrator', monitorHydrator);

/**
 * @return {string}
 */
let getMonitorConfigPath = () => {
    return path.join(__dirname, '/config/monitor-config.json');
};

/**
 * @return {string}
 */
let getAppConfigPath = () => {
    return path.join(__dirname, '/config/application.json');
};

function loadConfig () {
    config = JSON.parse(fs.readFileSync( getAppConfigPath(), {'encoding': 'UTF8'}));
    // TODO controll the flow of data
    delete config.modules;
}


function createWindowDashboard () {

    loadConfig();
    loadAppConfig();

    // App
    dashboard = new BrowserWindow({
        width: 1170,
        height: 800,
        titleBarStyle: 'hidden',
        x: 2400,
        y: 200,
        autoHideMenuBar: true
    });

    dashboard.loadURL(url.format({
        pathname: path.join(__dirname, '/dashboard.html'),
        protocol: 'file:',
        slashes: true
    }));

    // Emitted when the window is closed.
    dashboard.on('closed', () => {
        dashboard = null
    });


    if (config && config.debug === true) {
        dashboard.webContents.openDevTools({detached: true});
    }
}

/**
 * @param monitorsConfig
 * @returns {MonitorsManager}
 */
function createWindowsPlayer(monitorsConfig) {

    let monitorWrapper = hydratorManager.get('virtualHydrator').hydrate(monitorsConfig);

    for (let cont = 0; monitorWrapper.monitors.length > cont; cont++) {

        monitorWrapper.monitors[cont].browserWindows = createWindowPlayer(monitorWrapper.monitors[cont]);
    }
    return monitorWrapper;
}

/**
 * @param monitor
 * @returns {Electron.AllElectron.BrowserWindow}
 */
function createWindowPlayer(monitor) {

    let browserWindows = new BrowserWindow({
        width: parseInt(monitor.width),
        height: parseInt(monitor.height),
        x: parseInt(monitor.offsetX),
        y: parseInt(monitor.offsetY),
        movable: true,
        resizable: false,
        frame: false,
        enableLargerThanScreen: true,
        hasShadow: false

    });

    browserWindows.on('closed', () => {
        win = null
    });

    browserWindows.webContents.on('did-finish-load', () => {
        browserWindows.send('player-monitor-config', monitor);
    });

    if (config && config.debug === true) {
        browserWindows.webContents.openDevTools({detached: true});
    }

    browserWindows.loadURL(url.format({
        pathname: path.join(__dirname, '/player.html'),
        protocol: 'file:',
        slashes: true
    }));

    return browserWindows;
}


function loadAppConfig () {
    let path = getMonitorConfigPath();
    if (!fs.existsSync(path)) {
        return;
    }
    let appConfig = JSON.parse(fs.readFileSync(path, {'encoding': 'UTF8'}));
    if (appConfig && appConfig.monitorConfig) {
        monitorsWrapper = createWindowsPlayer(appConfig.monitorConfig);
    }
}


function closeWindowsPlayer() {

    if (!monitorsWrapper) {
        return;
    }

    for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
        monitorsWrapper.monitors[cont].browserWindows.close();
    }
    monitorsWrapper.clearMonitors();
}

/**
 *  This method will be called when Electron has finished initialization and is ready
 *  to create browser windows. Some APIs can only be used after this event occurs.
 */
app.on('ready', createWindowDashboard);

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

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (dashboard === null) {
        createWindowDashboard()
    }
})

/**
 * Impostazione di una nuova configurazione
 */
ipcMain.on('change-monitors-configuration', (event, message) => {

    fs.writeFile(
        getMonitorConfigPath(),
        JSON.stringify({'monitorConfig' : message}),
        function(err) {
            if(err) {
                return console.log("ReloadMonitor save error: " + err);
            }

            closeWindowsPlayer();
            monitorsWrapper = createWindowsPlayer(message);
        }
    );
});

/**
 * Modifica della configurazione abilitata
 */
ipcMain.on('update-enable-monitor-configuration', (event, message) => {

    if (message.monitors && Array.isArray(message.monitors) && message.monitors.length > 0) {

        fs.writeFile(
            getMonitorConfigPath(),
            JSON.stringify({'monitorConfig' : message}, null, 4),
            function(err) {
                if(err) {
                    return console.log("UpdateMonitor save error: " + err);
                }

                let virtualMonitor = hydratorManager.get('virtualHydrator').hydrate(message);

                for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
                    monitorsWrapper.monitors[cont].remove = true;
                }

                for (let cont = 0; virtualMonitor.monitors.length > cont; cont++) {

                    let currentMonitor = monitorsWrapper.getMonitor(virtualMonitor.monitors[cont].id);

                    switch (true) {
                        case currentMonitor === undefined :
                            virtualMonitor.monitors[cont].browserWindows = createWindowPlayer(virtualMonitor.monitors[cont]);
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
                        console.log('remove widows')
                    }
                }
            }
        );
    }
});


ipcMain.on('play-timeslot', (event, message) => {

    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getMonitor(message.timeslot.virtualMonitorReference.monitorId)
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

    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getMonitor(message.timeslot.virtualMonitorReference.monitorId)
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

    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getMonitor(message.timeslot.virtualMonitorReference.monitorId)
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

    switch (true) {
        case message.timeslot.virtualMonitorReference.virtualMonitorId === monitorsWrapper.id:
            /**
             * start timeslot in current monitor setting
             */
            if (monitorsWrapper.hasMonitor(message.timeslot.virtualMonitorReference.monitorId)) {
                monitorsWrapper.getMonitor(message.timeslot.virtualMonitorReference.monitorId)
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

    if (!monitorsWrapper || !monitorsWrapper.monitors || !Array.isArray(monitorsWrapper.monitors)) {
        return;
    }

    for (let cont = 0; monitorsWrapper.monitors.length > cont; cont++) {
        monitorsWrapper.monitors[cont].browserWindows.send(message.nameMessage, message.data);
    }
});