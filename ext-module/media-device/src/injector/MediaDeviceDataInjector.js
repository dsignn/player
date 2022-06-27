import {AbstractInjector} from './../../../timeslot/src/injector/AbstractInjector';

/**
 *
 */
export class MediaDeviceDataInjector extends AbstractInjector {

    constructor(mediaDeviceStorage) {
        super();

        this.storage = mediaDeviceStorage;
    }

    /**
     * @param {string} value
     * @return Promise
     */
    getServiceData(value) {
        return this.storage.getAll({name: value});
    }

    /**
     * @param {Object} data
     * @return Promise
     */
    getTimeslotData(data) {
        return new Promise((resolve, reject) => {

            this.storage.get(data.id).then(function(data) {

                let obj = {};
                obj[this.serviceNamespace] = data;
                resolve(obj);
            }.bind(this)).catch((err) => {
                reject(err);
            })
        });
    }

    /**
     * @param {MediaDevice} mediaDevice
     */
    extractTimeslot(mediaDevice) {
        return {'id' : mediaDevice.id};
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        return 'Media Device Data';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return MediaDeviceDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Media Device metadata';
    }

    /**
     * @returns {string}
     */
    get serviceNamespace () {
        return 'mediaDevice';
    }
}
