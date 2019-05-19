/**
 *
 * @type {Object}
 */
export const EntityPaginationBehavior = {

    properties: {

        entities : {
            type: Array,
            notify: true,
            value: []
        },

        page: {
            type: Number,
            value: 1
        },

        itemPerPage: {
            type: Number,
            value: 10
        },

        totalItems: {
            type: Number,
            readOnly: true,
            value: 0
        },

        storage: {

        },

        storageService: {
            type: String,
        },

        filter: {
            type: Object,
            value: {}
        }
    },

    /**
     * @param {Number} page
     * @param {Number} itemPerPage
     * @param storage
     */
    observerPaginationEntities(page, itemPerPage, storage) {

        if (!page || !itemPerPage || !storage) {
            return;
        }

        this.getPagedEntities();
    },

    /**
     * @param {ContainerAggregate} storageContainerAggregate
     * @param {string} storageService
     */
    observerStorage(storageContainerAggregate, storageService) {
        if (!storageContainerAggregate || !storageService || !storageContainerAggregate.has(storageService)) {
            return
        }

        this.storage = storageContainerAggregate.get(storageService);

        this.listenerUpdate = new (require("@dsign/library").event.Listener)(this.getPagedEntities.bind(this));
        this.storage.getEventManager().on(require("@dsign/library").storage.Storage.POST_SAVE, this.listenerUpdate);
    },

    /**
     *
     */
    getPagedEntities() {
        this.storage.getPaged(this.page, this.itemPerPage, this.filter)
            .then((data) => {
                this.set('entities', data);
                this._setTotalItems(data.totalItems);
            });
    },

    /**
     * @param {CustomEvent} evt
     */
    _deleteEntity(evt) {

        let index = null;
        this.entities.find((element, ind) => {
            if (element.id === evt.detail.id) {
                index = ind;
                return element;
            }
        });

        this.splice('entities', index, 1);

        this.storage.delete(evt.detail)
            .then((data) => {

            });
    },

    /**
     * @param {CustomEvent} evt
     */
    _updateEntity(evt) {

        this.storage.update(evt.detail)
            .then((data) => {

            });
    }
};
