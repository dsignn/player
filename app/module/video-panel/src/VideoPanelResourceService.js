
class VideoPanelResourceService {

    /**
     *
     * @param {Storage} storageMonitor
     * @param {Storage} storageVideoPanel
     * @param {Storage} storageResource
     * @param {AbstractHydrator} virtualMonitorMosaicHydrator
     * @param {AbstractHydrator} panelMosaicHydrator
     * @param {AbstractHydrator} resourceMosaicHydrator
     * @param {AbstractHydrator} monitorHydrator
     */
    constructor(
        storageMonitor,
        storageVideoPanel,
        storageResource,
        virtualMonitorMosaicHydrator,
        panelMosaicHydrator,
        resourceMosaicHydrator,
        monitorHydrator) {

        /**
         * @type {Storage}
         */
        this.storageMonitor = storageMonitor;

        /**
         * @type {Storage}
         */
        this.storageVideoPanel = storageVideoPanel;

        /**
         * @type {Storage}
         */
        this.storageResource = storageResource;

        /**
         * @type {AbstractHydrator}
         */
        this.virtualMonitorMosaicHydrator = virtualMonitorMosaicHydrator;

        /**
         * @type {AbstractHydrator}
         */
        this.panelMosaicHydrator = panelMosaicHydrator;

        /**
         * @type {AbstractHydrator}
         */
        this.resourceMosaicHydrator = resourceMosaicHydrator;

        /**
         * @type {AbstractHydrator}
         */
        this.monitorHydrator = monitorHydrator;
    }

    /**
     * @param {PanelResource} panelResource
     */
    async generateResource(panelResource) {

        /**
         * Contain MonitorMosaic
         *
         * @type {VirtualMonitor}
         */
        let virtualMonitorMosaic = this.virtualMonitorMosaicHydrator.hydrate(
            await this.storageMonitor.get(panelResource.getVideoPanel().virtualMonitorReference.virtualMonitorId)
        );

        /**
         * Contain VideoPanelMosaic
         *
         * @type {Panel}
         */
        let panelMosaic = this.panelMosaicHydrator.hydrate(panelResource);

        let mosaic = new Mosaic(virtualMonitorMosaic, panelMosaic);


        /**
   //     dance:
        for (let cont = 0; panelResource.resourcesInSideline.length > cont; cont++) {
            console.log('DIOAAAAA', panelResource.resourcesInSideline[cont]);

            /**
             * @type {Object}


            let resourceInSideline =  panelResource.resourcesInSideline[cont];

            /**
             * @type {PanelMosaicWrapper}

            let panelMosaicWrapperCurrent = mosaic.getPanelMosaicWrapper().getSideline(
                resourceInSideline.sidelineReference.sidelineId
            );

            /**
             * Array of id of resources
             * @type array

            let listResources = resourceInSideline.resources ? resourceInSideline.resources : [];

            /**
             * Index for count mod of the length of resources
             *
             * @type {number}

            let index = 0;

            while (panelMosaicWrapperCurrent.getRemainingWidth() > 0) {
                let computeCont = index % listResources.length;
                let resource = await this.storageResource.get(listResources[computeCont]);
                mosaic.addResource(
                    this.resourceMosaicHydrator.hydrate(this.storageResource.hydrator.extract(resource)),
                    panelMosaicWrapper.getSideline(resourceInSideline.sidelineReference.sidelineId),
                );
                index++;
            }
            //break dance;
        }

        mosaic.generate();

         */
    }
}

module.exports = VideoPanelResourceService;