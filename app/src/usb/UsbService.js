import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class UsbService
 */
export class UsbService extends EventManagerAware {

    /**
     * @return {string}
     */
     static get ATTACH_USB() { return 'attach-usb'; };

    /**
     * @return {string}
     */
     static get DETACH_USB() { return 'detach-usb'; };

    /**
     * 
     * @param {*} usb 
     */
    constructor(usb, driverList) {
        super();

        this.usb = usb;

        this.driverList = driverList;

        this.devices = [];

        this.driverList().then((devices) => {
            this.devices = this._filterUsb(devices);
        });

        usb.on('attach', this._attach.bind(this));
        usb.on('detach', this._detach.bind(this));
    }

    /**
     * @returns array
     */
    getDevice() {
        return this.devices;
    }

    /**
     * @param {*} device 
     */
    _attach(device) {

        setTimeout(
            () => {
                this.driverList()
                    .then((drives) => {

                        let diff = UsbService._diffDevices(
                            this._filterUsb(drives),
                            this.devices
                        );

                        for(let cont = 0; diff.length > cont; cont++) {
                            this.devices.push(diff[cont]);
                            this.getEventManager().emit(UsbService.ATTACH_USB, diff[cont]);
                        }
                    });
            },
            3000
        );
    }

    /**
     * @param {*} device 
     */
    _detach(device) {
        setTimeout(
            () => {
                this.driverList()
                    .then((drives) => {

                        let diff = UsbService._diffDevices(
                            this.devices,
                            this._filterUsb(drives)
                        );

                        for(let cont = 0; diff.length > cont; cont++) {
                            this.getEventManager().emit(UsbService.DETACH_USB, diff[cont]);
                        }
                        this.devices = this._filterUsb(drives);
                    });
            },
            3000
        );
    }

    /**
     * @param {Array} devices 
     * @returns 
     */
    _filterUsb(devices) {
        return devices.filter(
            (item) => {
                return item.isUSB === true;
            });
    }

    /**
     * @param {*} firstDevices 
     * @param {*} secondDevices 
     * @returns 
     */
    static _diffDevices(firstDevices, secondDevices) {
        return firstDevices.filter((item) => {

            let search = true;
            if (secondDevices.length > 0) {
                search = !!secondDevices.find((element) => {
                        if (item.devicePath !== element.devicePath) {
                            return false
                        } else {
                            return true;
                        }
                    });
            }          
            return search;
        })
    }
}