import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class PingDeviceService
 */
export class PingDeviceService extends EventManagerAware {

    constructor(auth, deviceStorage, osUtil, configStorage) {

        super();

        this.auth = auth;

        this.deviceStorage = deviceStorage;

        this.osUtil = osUtil;

        this.configStorage = configStorage;

        setInterval(this.ping.bind(this), 10000);
    }

    ping() {

        if (this.auth.getOrganization()) {
            this.osUtil._getMachineMessage()
                .then((data) => {

                    this.configStorage.get('name-plant')
                        .then((configData) => {

                            if (configData && configData.name) {
                                data.name = configData.name;
                            }


                            // TO DEV MOD
                            if (container.services.Auth.organization.id !== '653d18c9423b6b423a7f8336' ) {
                                data.id = data.id + '234';
                            }
/*
                            this.deviceStorage.save(data).then(
                                (device) => {
                                    
                                }
                            ).catch((error) => {
                                console.error(error);
                            });

                            */
                        });
                });
        }
    }
}