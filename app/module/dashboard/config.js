/**
 *
 */
class DashboardConfig extends PluginConfig {

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

        let storage = new Storage(
            new LocalStorage(
                'Dsign', // TODO refactor
                DashboardConfig.NAME_COLLECTION
            ),
            serviceManager.get('HydratorPluginManager').get('widgetHydrator')
        );

        serviceManager.get('StoragePluginManager').set(
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

        this.serviceManager.get('HydratorPluginManager').set(
            'widgetHydrator',
            widgetHydrator
        );
    }
}

module.exports = DashboardConfig;