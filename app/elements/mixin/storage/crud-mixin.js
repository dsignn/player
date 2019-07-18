/**
 * @type {Function}
 */
export const StorageCrudMixin = (superClass) => {

    return class extends superClass {

        static get properties() {
            return {

                /**
                 * @type StorageInterface
                 */
                _storage: {
                    type: Object,
                    notify: true,
                    readOnly: true
                }
            };
        }

        /**
         * @param evt
         * @param {CustomEvent} evt
         */
        _deleteEntity(evt) {

            if (!this._storage) {
                return;
            }

            let index = null;
            if (this.entities &&  Array.isArray(this.entities)) {
                this.entities.find((element, ind) => {
                    if (element.id === evt.detail.id) {
                        index = ind;
                        return element;
                    }
                });
            }

            if (index !== null) {
                this.splice('entities', index, 1);
            }

            this._storage.delete(evt.detail)
                .then((data) => {
                    console.log('Delete crud mizin', data);
                });
        }

        /**
         * @param evt
         * @param {CustomEvent} evt
         */
        _updateEntity(evt) {

            if (!this._storage) {
                return;
            }

            this._storage.update(evt.detail)
                .then((data) => {
                    console.log('Update crud mizin', data);
                });
        }

        /**
         * @param evt
         * @param {CustomEvent} evt
         */
        _saveEntity(evt) {

            if (!this._storage) {
                return;
            }

            this._storage.save(evt.detail)
                .then((data) => {
                    console.log('Save crud mizin', data);
                });
        }
    }
};
