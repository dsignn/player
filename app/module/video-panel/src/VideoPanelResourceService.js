
class VideoPanelResourceService {

    /**
     *
     * @param {Storage} storageMonitor
     * @param {Storage} storageSideline
     * @param {Storage} storageResource
     * @param {AbstractHydrator} monitorMosaicWrapperhydrator
     * @param {AbstractHydrator} sidelineMosaicWrapperhydrator
     * @param {AbstractHydrator} resourceMosaicHydrator
     * @param {AbstractHydrator} monitorHydrator
     */
    constructor(
        storageMonitor,
        storageSideline,
        storageResource,
        monitorMosaicWrapperhydrator,
        sidelineMosaicWrapperhydrator,
        resourceMosaicHydrator,
        monitorHydrator) {

        /**
         * @type {Storage}
         */
        this.storageMonitor = storageMonitor;

        /**
         * @type {Storage}
         */
        this.storageSideline = storageSideline;

        /**
         * @type {Storage}
         */
        this.storageResource = storageResource;

        /**
         * @type {AbstractHydrator}
         */
        this.monitorMosaicWrapperhydrator = monitorMosaicWrapperhydrator;

        /**
         * @type {AbstractHydrator}
         */
        this.sidelineMosaicWrapperhydrator = sidelineMosaicWrapperhydrator;

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
     * @param {SidelineResource} sidelineResource
     */
    async generateResource(sidelineResource) {

        /**
         * @type {Sideline}
         */
        let sideline = await this.storageSideline.get(sidelineResource.sidelineReference.sidelineId);

        /**
         * @type VirtualMonitor
         */
        let virtualContainer = await this.storageMonitor.get(sideline.virtualMonitorReference.virtualMonitorId);

        /**
         * @type {SidelineMosaicWrapper}
         */
        let sidelineMosaicWrapper =  this.sidelineMosaicWrapperhydrator.hydrate(this.storageSideline.hydrator.extract(sideline));

        /**
         * @type {Mosaic}
         */
        let mosaic = new Mosaic(
            this.monitorMosaicWrapperhydrator.hydrate(this.monitorHydrator.extract(
                virtualContainer.getMonitor(sideline.virtualMonitorReference.monitorId))
            ),
            sidelineMosaicWrapper
        );

   //     dance:
        for (let cont = 0; sidelineResource.resourcesInSideline.length > cont; cont++) {
            console.log('DIOAAAAA', sidelineResource.resourcesInSideline[cont]);

            /**
             * @type {Object}
             * TODO cambiare oggetto
             * { resources : [], sidelineReference : {}}
             */

            let resourceInSideline =  sidelineResource.resourcesInSideline[cont];

            /**
             * @type {SidelineMosaicWrapper}
             */
            let sidelineMosaicWrapperCurrent = mosaic.getSidelineMosaicWrapper().getSideline(
                resourceInSideline.sidelineReference.sidelineId
            );

            /**
             * Array of id of resources
             * @type array
             */
            let listResources = resourceInSideline.resources ? resourceInSideline.resources : [];

            /**
             * Index for count mod of the length of resources
             *
             * @type {number}
             */
            let index = 0;

            while (sidelineMosaicWrapperCurrent.getRemainingWidth() > 0) {
                let computeCont = index % listResources.length;
                let resource = await this.storageResource.get(listResources[computeCont]);
                mosaic.addResource(
                    this.resourceMosaicHydrator.hydrate(this.storageResource.hydrator.extract(resource)),
                    sidelineMosaicWrapper.getSideline(resourceInSideline.sidelineReference.sidelineId),
                );
                index++;
            }
            //break dance;
        }

        mosaic.generate();
    }
}

module.exports = VideoPanelResourceService;