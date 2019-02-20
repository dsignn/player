/**
 *
 */
class MonitorService {

    /**
     * @return {string}
     */
    static get LOAD_MONITOR() { return 'load-virtual-monitor'; };

    /**
     * @return {string}
     */
    static get CHANGE_MONITOR() { return 'change-virtual-monitor'; };

    /**
     * @return {string}
     */
    static get UPDATE_MONITOR() { return 'update-virtual-monitor'; };

    /**
     * @param {Storage} monitorStorage
     * @param {AbstractSender} sender
     */
    constructor(monitorStorage, sender) {

        /**
         * @type Storage
         */
        this.monitorStorage = monitorStorage;

        /**
         * @type AbstractSender
         */
        this.sender = sender;

        /**
         * @type {VirtualMonitor}
         */
        this.currentVirtualMonitor = {};

        /**
         * Event manager
         */
        this.eventManager = new (require('dsign-library').event.EvtManager)();

        /**
         * Add listener
         */
        this.monitorStorage.eventManager.on(
            require('dsign-library').storage.Storage.STORAGE_POST_UPDATE,
            this._checkChangeVirtualMonitor.bind(this)
        );

        /**
         * Load current virtual monitor config
         */
        this._loadCurrentVirtualMonitor();
    }

    /**
     * @private
     */
    _loadCurrentVirtualMonitor() {
        this.monitorStorage.getAll({enable: 1})
            .then((monitors) => {

                if (monitors.length === 0) {
                    return;
                }

                if (monitors.length > 1) {
                    console.warn('To many configuration enabled')
                }

                this.currentVirtualMonitor = monitors[0];
                this.eventManager.fire(MonitorService.LOAD_MONITOR, this.currentVirtualMonitor);
            })
    }

    /**
     * @private
     * @param evt
     */
    _checkChangeVirtualMonitor(evt) {

        if (evt.data.enable !== true)  {
            return;
        }

        if (evt.data.id !== this.currentVirtualMonitor.id) {
            this.currentVirtualMonitor = evt.data;
            this.eventManager.fire(MonitorService.CHANGE_MONITOR, this.currentVirtualMonitor);
            this.sender.send(MonitorService.CHANGE_MONITOR, this.currentVirtualMonitor);
        } else {
            this.currentVirtualMonitor = evt.data;
            this.eventManager.fire(MonitorService.UPDATE_MONITOR, this.currentVirtualMonitor);
            this.sender.send(MonitorService.UPDATE_MONITOR, this.currentVirtualMonitor);
        }
    }

    /**
     * @return {Electron.Display[]}
     */
    getPhysicalMonitor() {
        return require('electron').screen.getAllDisplays();
    }
}


module.exports = MonitorService;