
class SidelineResourceService {

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

        let sideline = await this.storageSideline.get(sidelineResource.sidelineReference.sidelineId);
        let virtualContainer = await this.storageMonitor.get(sideline.virtualMonitorReference.virtualMonitorId);
        let sidelineMosaicWrapper =  this.sidelineMosaicWrapperhydrator.hydrate(this.storageSideline.hydrator.extract(sideline));

        let mosaic = new Mosaic(
            this.monitorMosaicWrapperhydrator.hydrate(this.monitorHydrator.extract(
                virtualContainer.getMonitor(sideline.virtualMonitorReference.monitorId))
            ),
            sidelineMosaicWrapper
        );

        dance:
        for (let cont = 0; sidelineResource.resourcesInSideline.length > cont; cont++) {

            let listResources = sidelineResource.resourcesInSideline[cont].resources ? sidelineResource.resourcesInSideline[cont].resources : [];
            // TODO while le resource colmano la riga
            for (let cont2 = 0; listResources.length > cont2; cont2++) {

                let resource = await this.storageResource.get(listResources[cont2]);

                mosaic.addResource(
                    this.resourceMosaicHydrator.hydrate(this.storageResource.hydrator.extract(resource)),
                    sidelineMosaicWrapper.getSideline(sidelineResource.resourcesInSideline[cont].sidelineReference.sidelineId),
                );
                break dance;
            }
        }

        mosaic.generate();
    }
}

module.exports = SidelineResourceService;