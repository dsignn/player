import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class PingDeviceService
 */
export class PingDeviceService extends EventManagerAware {

    constructor(auth, deviceStorage, osUtil) {

        super();

        this.auth = auth;

        this.deviceStorage = deviceStorage;

        this.osUtil = osUtil;

        setInterval(this.ping.bind(this), 10000);
    }

    ping() {

        if (this.auth.getOrganization()) {
            this.osUtil._getMachineMessage()
                .then((data) => {
                    
                    this.deviceStorage.save(data).then(
                        (device) => {
                            
                        }
                    ).catch((error) => {
                        console.error(error);
                    });
                });
           
        }
    }
}