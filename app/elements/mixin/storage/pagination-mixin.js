/**
 * @type {Function}
 */
export const StoragePaginationMixin = (superClass) => {

    return class extends superClass {

        static get properties() {
            return {

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
                    readOnly: true
                },

                /**
                 * @type number
                 */
                page: {
                    type: Number,
                    value: 1
                },

                /**
                 * @type number
                 */
                itemPerPage: {
                    type: Number,
                    value: 10
                },

                /**
                 * @type number
                 */
                totalItems: {
                    type: Number,
                    readOnly: true,
                    value: 0
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
         * @private
         */
        _getPagedEntities() {

            this._storage.getPaged(this.page, this.itemPerPage, this.filter)
                .then((data) => {
                    this.set('entities', data);
                    this._setTotalItems(data.totalItems);
                });
        }
    }
};
