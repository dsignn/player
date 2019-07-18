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
                }
            };
        }

        /**
         * @param {Number} page
         * @param {Number} itemPerPage
         * @param storage
         */
        observerPaginationEntities(page, itemPerPage, storage) {

            if (!page || !itemPerPage || !storage) {
                return;
            }

            this.getEntities();
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
