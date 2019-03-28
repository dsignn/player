// Modules to control application life and create native browser window
const {app, BrowserWindow, protocol} = require('electron');
const path = require('path');
const fs = require('fs');

/**
 * @type Application
 */
class Application {

    /**
     * @param {Object} options
     */
    constructor(options) {

        /**
         *
         */
        this.browserWindow = null;

        /**
         * @type {String}
         */
        this.environment = options.env ? options.env : 'production';

        /**
         * @type {Object}
         */
        this.config = JSON.parse(
            fs.readFileSync(
                this._getPathConfig(),
                {'encoding': 'UTF8'}
            )
        );
    }

    /**
     * @return {string}
     * @private
     */
    _getPathConfig() {
        return path.join(__dirname, 'config', `config-${this.environment}.json`);
    }

    /**
     * @private
     */
    _getEntryPoint() {
        let entryPoint = 'entrypoint/dashboard/index.html';
        switch (this.environment) {
            case 'development':
                entryPoint = `development/${entryPoint}`;
                break;
        }
        return entryPoint;
    }

    /**
     * Run application
     */
    run() {
        this._createWindows();
    }

    /**
     * Create the browser window.
     * @private
     */
    _createWindows() {

        this.browserWindow = new BrowserWindow({
            webPreferences: {
                nodeIntegration: true,
            },
            titleBarStyle: 'hidden',
            autoHideMenuBar: true,
            icon: path.join(__dirname, 'style/icon/logo.png'),
            title: `P3E`,
            width: 500,
            height: 1200
        });

        if (this.environment === 'development') {
            this.browserWindow.webContents.openDevTools();
        }

        this.browserWindow.loadURL(`file://${__dirname}/${this._getEntryPoint()}`);

        /**
         * On close browser window
         */
        this.browserWindow.on('closed', () => {
            this.browserWindow = null
        })
    }
}

/**
 * Application options
 */
let options = {
    env: process.env.APP_ENVIRONMENT ? process.env.APP_ENVIRONMENT.trim() : 'production'
};

let application = new Application(options);

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
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the dock icon is clicked and there are no other windows open.
    if (application.browserWindow === null) {
        application.run();
    }
});
