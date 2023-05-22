const MediaDeviceDataInjector = (async () => {
  
    const { AbstractInjector } = await import(
        `${container.get('Application').getBasePath()}module/timeslot/src/injector/AbstractInjector.js`);

    /**
     *
     */
    class MediaDeviceDataInjector extends AbstractInjector {

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

                    resolve(data);
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

    return {MediaDeviceDataInjector: MediaDeviceDataInjector};
})();

export default MediaDeviceDataInjector;
export const then = MediaDeviceDataInjector.then.bind(MediaDeviceDataInjector);