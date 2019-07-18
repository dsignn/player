/**
 * @type {Function}
 */
export const StorageEntityMixin = (superClass) => {

    return class extends superClass {

        static get properties() {
            return {
                /**
                 * @type object
                 */
                entity: {
                    type: Object,
                    notify: true,
                    value: {}
                },

                /**
                 * @type StorageInterface
                 */
                _storage: {
                    type: Object,
                    notify: true,
                    readOnly: true,
                    observer: "_changedStorage"
                },

                /**
                 * @type boolean
                 */
                autoUpdateEntity: {
                    type: Boolean,
                    value: false
                }
            };
        }

        /**
         * @return {string}
         */
        getStorageUpsertMethod() {
            return this.entity.id ? 'update' : 'save';
        }

        /**
         * @param newValue
         * @private
         */
        _changedStorage(newValue) {

            if (!newValue) {
                return;
            }

            let hydrator = new newValue.getHydrator();

            if (typeof hydrator.getTemplateObjectHydration !== 'function' || this.entity instanceof hydrator.getTemplateObjectHydration().constructor) {
                return;
            }

            this.entity = hydratorContainerAggregate.get(entityHydrator).hydrate(this.entity);
            if (this.autoUpdateEntity) {
                this._autoUpdateFn();
            }
        }

        /**
         * @private
         */
        _autoUpdateFn() {

            this.updateListener = new (require("@dsign/library").event.Listener)(function (evt) {
                if (evt.data.id === this.entity.id) {
                    this.entity = null;
                    this.entity = evt.data;
                }

            }.bind(this));

            this._storage.getEventManager().on(require("@dsign/library").storage.Storage.POST_UPDATE, this.updateListener);
        }
    }
};
