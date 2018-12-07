
class SidelineResourceService {

    /**
     *
     * @param {Storage} storageMonitor
     * @param {Storage} storageSideline
     * @param {Storage} storageResource
     * @param {AbstractHydrator} sidelineMosaicWrapperhydrator
     */
    constructor(storageMonitor, storageSideline, storageResource, sidelineMosaicWrapperhydrator) {

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
        this.sidelineMosaicWrapperhydrator = sidelineMosaicWrapperhydrator;
    }

    /**
     * @param {SidelineResource} sidelineResource
     */
    async generateResource(sidelineResource) {

        let sideline = await this.storageSideline.get(sidelineResource.sidelineReference.sidelineId);
        let sidelineMosaicWrapper = this.sidelineMosaicWrapperhydrator.hydrate(
            this.sidelineMosaicWrapperhydrator.extract(sideline)
        );
        let virtualContainer = await this.storageMonitor.get(sidelineMosaicWrapper.virtualMonitorReference.virtualMonitorId);
        let monitor = virtualContainer.getMonitor(sidelineMosaicWrapper.virtualMonitorReference.monitorId);

        let mosaic = new Mosaic(monitor, sidelineMosaicWrapper);

        dance:
        for (let cont = 0; sidelineResource.resourcesInSideline.length > cont; cont++) {

            let listResources = sidelineResource.resourcesInSideline[cont].resources ? sidelineResource.resourcesInSideline[cont].resources : [];
            // TODO while le resource colmano la riga
            for (let cont2 = 0; listResources.length > cont2; cont2++) {

                let resource = await this.storageResource.get(listResources[cont2]);

                mosaic.addResource(
                    resource,
                    sidelineMosaicWrapper.getSideline(sidelineResource.resourcesInSideline[cont].sidelineReference.sidelineId),
                );
                break dance;
            }
        }

        mosaic.generate();
    }
}

module.exports = SidelineResourceService;