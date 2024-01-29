import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class ConnectionService
 */
export class ConnectionService extends EventManagerAware {

    static get ONLINE() { return 'online'; }

    static get OFFLINE() { return 'offline'; }

    static get CHANGE_STATUS() { return 'change'; }

    constructor() {
        super();

        this.status = navigator.onLine ? ConnectionService.ONLINE : ConnectionService.OFFLINE;

        window.addEventListener('online', this.updateOnlineStatus.bind(this));
        window.addEventListener('offline', this.updateOfflineStatus.bind(this)); 
    }

    updateOnlineStatus(evt) {
        this.status =  ConnectionService.ONLINE;
        this.getEventManager().emit(ConnectionService.CHANGE_STATUS);
    }

    updateOfflineStatus(evt) {
        this.status =  ConnectionService.OFFLINE;
        this.getEventManager().emit(ConnectionService.CHANGE_STATUS);
    }

    getStatus() {
        return this.status;
    }
}
