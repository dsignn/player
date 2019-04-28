/**
 *
 * @type {Object}
 */
export const EntityBehavior = {

    properties: {

        entity : {
            type: Object,
            notify: true,
            value: {}
        },

        entityHydrator : {
            type: String,
            notify: true
        }
    },

    /**
     * @return {string}
     */
    getStorageUpsertMethod() {
        return this.entity.id ? 'update' : 'save';
    },

    /**
     *
     * @param entity
     * @param entityHydrator
     * @param {AbstractHydrator} hydratorContainerAggregate
     */
    observerEntityToInject(entity, entityHydrator, hydratorContainerAggregate) {

        if (!entity || !hydratorContainerAggregate) {
            return;
        }

        if (!hydratorContainerAggregate.has(entityHydrator) ||
            typeof hydratorContainerAggregate.get(entityHydrator).getTemplateObjectHydration !== 'function' ||
            this.entity instanceof hydratorContainerAggregate.get(entityHydrator).getTemplateObjectHydration().constructor
        ) {
            return;
        }

        this.entity = hydratorContainerAggregate.get(entityHydrator).hydrate(this.entity);
    },

    /**
     * @param {Storage} storage
     */
    observerStorageToUpdateEntity(storage) {
        if (!storage) {
            return;
        }

        this.updateListener = new (require("@p3e/library").event.Listener)(function (evt) {

            if (evt.data.id === this.entity.id) {
                this.entity = null;
                this.entity = evt.data;
            }

        }.bind(this));

        storage.getEventManager().on(require("@p3e/library").storage.Storage.POST_UPDATE, this.updateListener);
    }
};