
class SidelineResourceService {

    /**
     *
     * @param {Storage} storageMonitor
     * @param {Storage} storageSideline
     * @param {Storage} storageResource
     */
    constructor(storageMonitor, storageSideline, storageResource) {

        this.storageMonitor = storageMonitor;
        this.storageSideline = storageSideline;
        this.storageResource = storageResource;
    }

    /**
     * @param {SidelineResource} sidelineResource
     */
    async generateResource(sidelineResource) {

        let sideline = await this.storageSideline.get(sidelineResource.sidelineReference.sidelineId);
        let virtualContainer = await this.storageMonitor.get(sideline.virtualMonitorReference.virtualMonitorId);
        let monitor = virtualContainer.getMonitor(sideline.virtualMonitorReference.monitorId);

        let mosaic = new Mosaic(monitor, sideline);

        dance:
        for (let cont = 0; sidelineResource.resourcesInSideline.length > cont; cont++) {

            let listResources = sidelineResource.resourcesInSideline[cont].resources ? sidelineResource.resourcesInSideline[cont].resources : [];
            // TODO while le resource colmano la riga
            for (let cont2 = 0; listResources.length > cont2; cont2++) {

                let resource = await this.storageResource.get(listResources[cont2]);

                mosaic.addResource(
                    resource,
                    sideline.getSideline(sidelineResource.resourcesInSideline[cont].sidelineReference.sidelineId),
                );
                break dance;
            }
        }

        mosaic.generate();
    }
}

module.exports = SidelineResourceService;