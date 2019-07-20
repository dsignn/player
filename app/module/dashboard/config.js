/**
 *
 */
class DashboardConfig extends require("@dsign/library").container.ContainerAware {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_COLLECTION() { return 'widget'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_STORAGE_SERVICE() { return 'WidgetStorage'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_ENTITY_SERVICE() { return 'WidgetEntity'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get WIDGET_HYDRATOR_SERVICE() { return 'DashboardEntityHydrator'; };


    /**
     *
     */
    init() {
        this.initEntity();
        this.initHydrator();
        this.initStorage();
    }

    /**
     *
     */
    initEntity() {
        this.getContainer()
            .get('EntityContainerAggregate')
            .set(DashboardConfig.WIDGET_ENTITY_SERVICE, new WidgetEntity());
    }

    /**
     *
     */
    initHydrator() {

        this.getContainer()
            .get('HydratorContainerAggregate')
            .set(
                DashboardConfig.WIDGET_HYDRATOR_SERVICE,
                DashboardConfig.getWidgetEntityHydrator(this.getContainer().get('EntityContainerAggregate'))
            );
    }


    /**
     *
     */
    initStorage() {

        const adapter = new (require("@dsign/library").storage.adapter.localStorage.LocalStorageAdapter)(
            this.getContainer().get('Config').storage.adapter.localStorage.namespace,
            DashboardConfig.WIDGET_COLLECTION
        );

        const storage = new (require("@dsign/library").storage.Storage)(adapter);

        storage.setHydrator(this.getContainer().get('HydratorContainerAggregate').get(DashboardConfig.WIDGET_HYDRATOR_SERVICE));

        storage.getEventManager().on(
            require("@dsign/library").storage.Storage.BEFORE_SAVE,
            (evt) => {
                let mongoIdGen = new (require("@dsign/library").storage.util.MongoIdGenerator)();
                evt.data.id = mongoIdGen.generateId();
            }
        );

        this.getContainer().get('StorageContainerAggregate').set(
            DashboardConfig.WIDGET_STORAGE_SERVICE,
            storage
        );

    }

    /**
     * @param {ContainerAggregate} container
     */
    static getWidgetEntityHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            container.get(DashboardConfig.WIDGET_ENTITY_SERVICE)
        );

        hydrator.enableExtractProperty('id')
            .enableExtractProperty('col')
            .enableExtractProperty('row')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('wc')
            .enableExtractProperty('data');

        hydrator.enableHydrateProperty('id')
            .enableHydrateProperty('col')
            .enableHydrateProperty('row')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('wc')
            .enableHydrateProperty('data');

        return hydrator;
    }

    /**
     *
     * @param container
     * @return {PropertyHydrator}
     */
    static getPathHydrator(container) {

        let hydrator = new (require("@dsign/library").hydrator.PropertyHydrator)(
            new (require("@dsign/library").path.Path)()
        );

        hydrator.enableHydrateProperty('directory')
            .enableHydrateProperty('nameFile')
            .enableHydrateProperty('extension');

        hydrator.enableExtractProperty('directory')
            .enableExtractProperty('nameFile')
            .enableExtractProperty('extension');

        return hydrator;
    }
}

module.exports = DashboardConfig;
