/**
 *
 */
class MonitorService {

    /**
     * @return {string}
     */
    static get LOAD_MONITOR() { return 'paper-player-config'; };

    /**
     * @return {string}
     */
    static get CHANGE_MONITOR() { return 'paper-player-change'; };

    /**
     * @return {string}
     */
    static get UPDATE_MONITOR() { return 'paper-player-update'; };

    /**
     * @return {string}
     */
    static get DASHBOARD_ALWAYS_ON_TOP() { return 'dashboard-always-on-top'; };

    /**
     * @param {Storage} monitorStorage
     * @param {AbstractSender} sender
     * @param {boolean} alwaysOnTopDashboard
     * @param {string} resourcePath
     */
    constructor(monitorStorage, sender, alwaysOnTopDashboard, resourcePath) {

        /**
         * @type {Storage}
         */
        this.monitorStorage = monitorStorage;

        /**
         * @type {AbstractSender}
         */
        this.sender = sender;

        /**
         * @type {MonitorContainerEntity}
         */
        this.enableMonitor = {};

        /**
         * @type {boolean}
         */
        this.alwaysOnTopDashboard = alwaysOnTopDashboard;

        /**
         *
         */
        this.resourcePath = resourcePath;

        /**
         * Update listener
         */
        this.monitorStorage.getEventManager().on(
            require("@dsign/library").storage.Storage.BEFORE_UPDATE,
            this._checkUpdateMonitor.bind(this)
        );

        /**
         * Get current configuration
         */
        this.monitorStorage.getAll({enable:1})
            .then((enableMonitors) => {


                if (enableMonitors.length === 0) {
                    return;
                }

                if (enableMonitors.lenght > 1) {
                    console.warn('More then one configuration enable bring the first');

                }
                this.enableMonitor = enableMonitors[0];
            });

    }

    /**
     * @return {}
     */
    getEnableMonitor() {
        return this.enableMonitor;
    }

    /**
     * @param evt
     */
    _checkUpdateMonitor(evt) {

        if (!evt.data.enable) {
            return;
        }

        switch (true) {
            case evt.data.id === this.enableMonitor.id:
                this.sender.send(MonitorService.UPDATE_MONITOR, evt.data);
                break;
            default:
                this._clearMonitorsEnabled();
                this.sender.send(MonitorService.CHANGE_MONITOR, evt.data);
                break;
        }

        this.enableMonitor = evt.data;
    }

    /**
     * @private
     */
    _clearMonitorsEnabled() {
        this.monitorStorage.getAll({enable:1})
            .then((data) => {
                for(let cont = 0; data.length > cont; cont++) {
                    data[cont].enable = false;
                    this.monitorStorage.update(data[cont]);
                }
            });
    }

    /**
     * @return {Electron.Display[]}
     */
    getPhysicalMonitor() {
        return require('electron').screen.getAllDisplays();
    }

    /**
     * @return {boolean}
     */
    getAlwaysOnToDashboard() {
        return this.alwaysOnTopDashboard;
    }

    /**
     * @param alwaysOnTopDashboard
     * @return {MonitorService}
     */
    setAlwaysOnToDashboard(alwaysOnTopDashboard) {
        this.alwaysOnTopDashboard = alwaysOnTopDashboard;
        this.sender.send(MonitorService.DASHBOARD_ALWAYS_ON_TOP, {checked: this.alwaysOnTopDashboard});
        return this;
    }
}

module.exports = MonitorService;
