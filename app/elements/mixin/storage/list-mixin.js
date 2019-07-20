/**
 * @type {Function}
 */
export const StorageListMixin = (superClass) => {

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
                 * @type Array
                 */
                entities : {
                    type: Array,
                    notify: true,
                    value: []
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
                 * @type object
                 */
                filter: {
                    type: Object,
                    value: {}
                    // TODO add observer
                },

                autoladEntities: {
                    type: Boolean,
                    value: false
                }
            };
        }

        /**
         * @param {StorageInterface} newValue
         * @private
         */
        _changedStorage(newValue) {

            if (!newValue) {
                return;
            }

            if (super["_changedStorage"] && typeof this.super["_changedStorage"] === "function") {
                super["_changedStorage"](newValue);
            }

            this.listenerUpdate = new (require("@dsign/library").event.Listener)(this.getAll.bind(this));
            newValue.getEventManager().on(require("@dsign/library").storage.Storage.POST_SAVE, this.listenerUpdate);

            if(this.autoladEntities) {
                this.getAll();
            }
        }

        /**
         *
         */
        getAll() {
            this._storage.getAll(this.filter)
                .then((data) => {
                    this.set('entities', data);
                });
        }
    }
};
