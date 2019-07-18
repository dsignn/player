/**
 * @type {Function}
 */
export const ServiceInjectorMixin = (superClass) => {

    return class extends superClass {

        static get properties() {
            return {
                services: {
                    type: Object,
                    observer: 'changeServices'
                }
            };
        }

        /**
         * @param newValue
         */
        changeServices(newValue) {
            if (!newValue) {
                return;
            }

            this._searchService(newValue);
        }

        /**
         * @param services
         * @param subContainer
         * @private
         */
        _searchService(services, subContainer) {

            if (services === null || typeof services !== 'object') {
                return;
            }

            for (let property in services) {


                switch (true) {
                    case typeof services[property] === 'object' && container.has(property):
                        this._searchService(services[property], container.get(property));
                        break;
                    default:
                        switch (true) {
                            case container.has(services[property]) === true:
                                container.getAsync(services[property])
                                    .then((service) => {
                                        this._setService(service, property);
                                    });
                                break;
                            case !!subContainer === true:
                                subContainer.getAsync(services[property])
                                    .then((service) => {
                                        this._setService(service, property);
                                    });
                                break
                        }
                        break;
                }
            }
        }

        /**
         * @param service
         * @param property
         * @private
         */
        _setService(service, property) {

            let readOnlyFunc = `_set${property.charAt(0).toUpperCase() + property.slice(1)}`;
            if (this.__readOnly && this.__readOnly[property] && this[readOnlyFunc]) {
                /**
                 * set read only property
                 */
                this[readOnlyFunc](service);
            } else {
                /**
                 * set public property
                 */
                this[property] = service;
            }
        }
    }
};
