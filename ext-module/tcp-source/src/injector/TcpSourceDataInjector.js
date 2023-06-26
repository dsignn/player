const TcpSourceDataInjector = (async () => {

    const { AbstractInjector } = await import(
        `${container.get('Application').getBasePath()}module/timeslot/src/injector/AbstractInjector.js`);

    /**
    *
    */
    class TcpSourceDataInjector extends AbstractInjector {

        /**
         * @param {Storage} storage 
         */
        constructor(storage) {
            super();


            /**
             * @type {Storage}
             */
            this.storage = storage;
        }


        /**
         * @param {string} value
         * @return Promise
         */
        getServiceData(value) {
            console.log('value', value);
            return this.storage.getAll({name: value});
        }

        /**
       * @param {Object} data
       * @return Promise
       */
        getTimeslotData(data) {
            return this.storage.get(data.id);
        }

        /**
         * @param {EntityIdentifier} entity
         */
        extractTimeslot(entity) {
            return { 'id': entity.id };
        }

        /**
         *  @return string
         */
        get serviceLabel() {
            return 'Tcp source data';
        }

        /**
         *  @return string
         */
        get serviceName() {
            return this.constructor.name;
        }

        /**
         *  @return string
         */
        get serviceDescription() {
            return 'tcp source metadata';
        }

        get serviceNamespace() {
            return 'tcp-source';
        }
    }

    return {TcpSourceDataInjector: TcpSourceDataInjector};
})();

export default TcpSourceDataInjector;
export const then = TcpSourceDataInjector.then.bind(TcpSourceDataInjector);

