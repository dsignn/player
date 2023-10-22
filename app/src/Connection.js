import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class Connection
 */
export class Connection extends EventManagerAware {

    static get ONLINE() { return 'online'; }

    static get OFFLINE() { return 'offline'; }

    static get CHANGE_STATUS() { return 'change'; }

    constructor() {
        super();

        this.status = navigator.onLine ? Connection.ONLINE : Connection.OFFLINE;

        window.addEventListener('online', this.updateOnlineStatus.bind(this));
        window.addEventListener('offline', this.updateOfflineStatus.bind(this)); 
    }

    updateOnlineStatus(evt) {
        this.status =  Connection.ONLINE;
        this.getEventManager().emit(Connection.CHANGE_STATUS);
    }

    updateOfflineStatus(evt) {
        this.status =  Connection.OFFLINE;
        this.getEventManager().emit(Connection.CHANGE_STATUS);
    }

    getStatus() {
        return this.status;
    }
}
