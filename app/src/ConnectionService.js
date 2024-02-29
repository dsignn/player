import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class ConnectionService
 */
export class ConnectionService extends EventManagerAware {

    static get ONLINE() { return 'online'; }

    static get OFFLINE() { return 'offline'; }

    static get CHANGE_STATUS() { return 'change'; }

    constructor(interval) {
        super();

        this.status = ConnectionService.OFFLINE;

        this.interval = interval ? interval : 2000;

        setInterval(
            () => {
                this._sendPing();
            },
            this.interval
        );
      
    }

    getStatus() {
        return this.status;
    }

    _sendPing() {
        
        fetch('https://www.google.com').then(
            (response) => {
                if (this.status != ConnectionService.ONLINE) {
                    this.status = ConnectionService.ONLINE;
                    this.getEventManager().emit(ConnectionService.CHANGE_STATUS, this.status);
                    console.log('si');
                }
            }
        ).catch((error) => {
            if (this.status != ConnectionService.OFFLINE) {
                this.status = ConnectionService.OFFLINE;
                this.getEventManager().emit(ConnectionService.CHANGE_STATUS, this.status);
                console.log('no');
            }
        });
    
    }
}
