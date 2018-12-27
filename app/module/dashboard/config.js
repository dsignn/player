/**
 *
 */
class DashboardConfig extends require('dsign-library').core.ModuleConfig {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_WIDGET_SERVICE() { return 'dashboard.widget.service'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_STORAGE() { return 'dashboard.data'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get NAME_COLLECTION() { return 'dashboard'; };


    init() {

        this._loadHydrator();
        this._loadStorage();
    }

    /**
     * @private
     */
    _loadStorage() {
        let storage = new dsign.storage.Storage(
            new dsign.storage.adapter.LocalStorage(
                this.getServiceManager().get('Config').indexedDB.name,
                DashboardConfig.NAME_COLLECTION
            ),
            this.getServiceManager().get('HydratorPluginManager').get('widgetHydrator')
        );

        this.getServiceManager().get('StoragePluginManager').set(
            DashboardConfig.NAME_WIDGET_SERVICE,
            storage
        );
    }

    /**
     * @private
     */
    _loadHydrator() {
        let widgetHydrator = new PropertyHydrator(
            new Widget()
        );

        widgetHydrator.enableExtractProperty('id')
            .enableExtractProperty('col')
            .enableExtractProperty('row')
            .enableExtractProperty('height')
            .enableExtractProperty('width')
            .enableExtractProperty('wc')
            .enableExtractProperty('data');

        widgetHydrator.enableHydrateProperty('id')
            .enableHydrateProperty('col')
            .enableHydrateProperty('row')
            .enableHydrateProperty('height')
            .enableHydrateProperty('width')
            .enableHydrateProperty('wc')
            .enableHydrateProperty('data');

        this.getServiceManager().get('HydratorPluginManager').set(
            'widgetHydrator',
            widgetHydrator
        );
    }
}

module.exports = DashboardConfig;