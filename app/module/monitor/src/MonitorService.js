import { EventManagerAware } from "@dsign/library/src/event";
import {Storage} from "@dsign/library/src/storage/Storage";
import {ResourceSenderEntity} from "./../../resource/src/entity/ResourceSenderEntity";

/**
 * @class MonitorService
 */
export class MonitorService extends EventManagerAware {

    /**
     * @return {string}
     */
    static get LOADING_MONITOR_FINISH() { return 'windos-loading-finish'; };

    /**
     * @return {string}
     */
     static get LOADING_MONITOR() { return 'windos-loading-start'; };

    /**
     * @return {string}
     */
    static get LOAD_MONITOR() { return 'paper-player-windos-loading'; };

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
    static get DISABLE_MONITOR() { return 'paper-player-disable'; };

    /**
     * @return {string}
     */
    static get DASHBOARD_ALWAYS_ON_TOP() { return 'dashboard-always-on-top'; };

    /**
     * @param {Storage} monitorStorage
     * @param {AbstractSender} sender
     * @param receiver
     * @param {boolean} alwaysOnTopDashboard
     * @param {string} resourcePath
     */
    constructor(monitorStorage, sender, receiver, alwaysOnTopDashboard, resourcePath) {
        super();

        /**
         * @type {Storage}
         */
        this.monitorStorage = monitorStorage;

        /**
         * @type {AbstractSender}
         */
        this.sender = sender;


        /**
         * @type Ipc
         */
        this.receiver = receiver;

        /**
         *
         */
        this.receiver.on('monitors', (event, data) => {
            this.screen = data;
        });

        this.receiver.on('loading-player-windows', (event, data) => {
            this.eventManager.emit(MonitorService.LOAD_MONITOR, {});
        });

        this.receiver.on('loading-player-windows-finish', (event, data) => {
            this.eventManager.emit(MonitorService.LOADING_MONITOR_FINISH, {});
        });


        this.sender.send('monitors', {'mock': 'mock'});

        /**
         * @type {MonitorContainerEntity}
         */
        this.enableMonitor = null;

        this.resourceSender = null;

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
        this.monitorStorage.getEventManager().on(Storage.BEFORE_UPDATE, this._checkUpdateMonitor.bind(this));

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

        const { screen } = require('electron');
        this.screen = screen;

    }

    /**
     * @param {ResourceSenderService} resourceSender 
     */
    setResourceSender(resourceSender) {
        this.resourceSender = resourceSender;

        if (this.enableMonitor) {
            setTimeout(function() {
                
                    this._updateResourceBackground();
                }.bind(this), 
                10000
            );
        }
    }

    /**
     * 
     */
    _updateResourceBackground() {

        if (!this.getEnableMonitor()) {
            return;
        }

        let monitors = this.enableMonitor.getMonitors({nested:true});

        for(let cont = 0; monitors.length > cont; cont++) {
            if (monitors[cont].backgroundResource && monitors[cont].backgroundResource.id) {
                console.log('METTI BACKGROUND ', monitors[cont].name)
                this._sendBackgroundResourceMonitor(monitors[cont].backgroundResource, monitors[cont], this.enableMonitor.id);
            } else {
                console.log('PILISCI ', monitors[cont].name)
                this.resourceSender.clearLayer(monitors[cont], 'default');
            }
        }
    }

    /**
     * @param {*} reference 
     * @param {*} monitor 
     * @param {*} idMonitorContainer 
     */
    _sendBackgroundResourceMonitor(reference, monitor, idMonitorContainer) {
        
        let resourceSenderEntity = new ResourceSenderEntity();
        resourceSenderEntity.resourceReference = reference;
        resourceSenderEntity.resourceReference.context = 'default';
        resourceSenderEntity.resourceReference.rotation = 'rotation-infinity';

        resourceSenderEntity.monitorContainerReference = {};
        resourceSenderEntity.monitorContainerReference.parentId = idMonitorContainer;
        resourceSenderEntity.monitorContainerReference.id = monitor.id;

        this.resourceSender.play(resourceSenderEntity);
    } 

    /**
     * @return {MonitorContainerEntity}
     */
    getEnableMonitor() {
        return this.enableMonitor;
    }

    /**
     * @param evt
     */
    _checkUpdateMonitor(evt) {


 
        switch (true) {
            case (this.enableMonitor != null  && evt.data.id === this.enableMonitor.id && evt.data.enable === false):
                console.log('DISABLE', evt.data.name, this.enableMonitor.name)
                this.sender.send(MonitorService.DISABLE_MONITOR, evt.data);
                this.eventManager.emit(MonitorService.DISABLE_MONITOR, evt.data);
                this.enableMonitor = null;
                break;
            case (this.enableMonitor != null && evt.data.id === this.enableMonitor.id && evt.data.enable === true):
                console.log('ENABLE', evt.data.name, this.enableMonitor)

                this.enableMonitor = evt.data;
                this.sender.send(MonitorService.UPDATE_MONITOR, evt.data);
                this.eventManager.emit(MonitorService.UPDATE_MONITOR, evt.data);
                this._updateResourceBackground();
              
                break;
            case (evt.data.enable === true):
                console.log('CHANGE', evt.data.name)
                this._clearMonitorsEnabled();
                this.enableMonitor = evt.data;
                this.sender.send(MonitorService.CHANGE_MONITOR, evt.data);
                this.eventManager.emit(MonitorService.CHANGE_MONITOR, evt.data);
        
                break;
        }
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
        return this.screen
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
