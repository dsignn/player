
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
     * @param {string} relativeStoragePath
     */
    constructor(
        storageMonitor,
        storageVideoPanel,
        storageResource,
        virtualMonitorMosaicHydrator,
        panelMosaicHydrator,
        resourceMosaicHydrator,
        monitorHydrator,
        relativeStoragePath = null
    ) {

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

        /**
         * @type {string|null}
         */
        this.relativeStoragePath = relativeStoragePath;
    }

    /**
     * @param {PanelResource} panelResource
     * @param {LocationPath} locationPath
     * @return {Promise}
     */
    async generateResource(panelResource, locationPath) {

        /** @type {VirtualMonitor} */
        let virtualMonitorMosaic = this.virtualMonitorMosaicHydrator.hydrate(
            await this.storageMonitor.get(panelResource.getVideoPanel().virtualMonitorReference.virtualMonitorId)
        );
        /** @type {Panel} */
        let panelMosaic = this.panelMosaicHydrator.hydrate(panelResource);
        /** @type {Number} */
        let index = 0;
        /** @type {VideoPanelMosaic} */
        let parentVideoPanel = panelMosaic.getVideoPanel();
        /** @type {VideoPanelMosaic} */
        let currentInternalChildVideoPanel = panelMosaic.getVideoPanel().getVideoPanels()[index];
        /** @type {Monitor} */
        let parentMonitor =  virtualMonitorMosaic.getMonitor(parentVideoPanel.virtualMonitorReference.monitorId);
        /** @type {MonitorMosaic} */
        let currentInternalMonitor = virtualMonitorMosaic.getMonitor(currentInternalChildVideoPanel.virtualMonitorReference.monitorId);
        currentInternalMonitor.initMonitor();

        /** @type {Mosaic} */
        let mosaic = new Mosaic();
        let container = this.getMosaicMonitorContainer(virtualMonitorMosaic, panelMosaic);

        mosaic.setBasePanel(container.width, container.height, 'black');
        mosaic.setDestination(locationPath);

        let crop = null;

        /**
         *
         */
        while (parentVideoPanel.getRemainingWidth() > 0) {

            while (currentInternalChildVideoPanel.getRemainingWidth() > 0) {

                if (currentInternalChildVideoPanel.resources.length == 0) {

                    currentInternalChildVideoPanel.sumRemainingWidth(currentInternalChildVideoPanel.width);
                    parentVideoPanel.sumRemainingWidth(currentInternalChildVideoPanel.width);
                    break;
                }

                let resources = currentInternalChildVideoPanel.resources;
                for (let cont = 0; resources.length > cont; cont++) {

                    if (currentInternalChildVideoPanel.getRemainingWidth() === 0) {
                        break;
                    }

                    /** @type ResourceMosaic */
                    let resourceMosaic = this.resourceMosaicHydrator.hydrate(
                        await this.storageResource.get(resources[cont].referenceId)
                    );

                    /**
                     * Check if resource has an absolute path
                     */
                    if (!resourceMosaic.location.isAbsolute()) {
                        resourceMosaic.location.setPath(`${this.relativeStoragePath}/${resourceMosaic.location.getPath()}`);
                    }

                    while (resourceMosaic.getRemainingWidth() > 0) {


                        switch (true) {
                            /**
                             * TODO comment
                             */
                            case resourceMosaic.getRemainingWidth() > currentInternalChildVideoPanel.getRemainingWidth():
                                crop = new Crop(
                                    currentInternalChildVideoPanel.getRemainingWidth(),
                                    resourceMosaic.dimension.height,
                                    resourceMosaic.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(resourceMosaic, currentInternalMonitor.progressOffsetX, currentInternalMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                currentInternalChildVideoPanel.sumRemainingWidth(currentInternalChildVideoPanel.getRemainingWidth());
                                parentVideoPanel.sumRemainingWidth(currentInternalChildVideoPanel.getRemainingWidth());
                                resourceMosaic.sumRemainingWidth(resourceMosaic.getRemainingWidth());
                                /**
                                 * Debug
                                 */
                                //  console.log('FINE RIGA');
                                //this.log(parentVideoPanel, currentInternalChildVideoPanel, currentInternalMonitor, resourceMosaic, crop.toString());
                                break;
                            /**
                             * TODO comment
                             */
                            case resourceMosaic.getRemainingWidth() === currentInternalMonitor.getRemainingWidth():
                                crop = new Crop(
                                    resourceMosaic.getRemainingWidth(),
                                    resourceMosaic.dimension.height,
                                    resourceMosaic.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(resourceMosaic, currentInternalMonitor.progressOffsetX, currentInternalMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                currentInternalChildVideoPanel.sumRemainingWidth(currentInternalMonitor.getRemainingWidth());
                                parentVideoPanel.sumRemainingWidth(currentInternalMonitor.getRemainingWidth());
                                resourceMosaic.sumRemainingWidth(currentInternalMonitor.getRemainingWidth());
                                currentInternalMonitor.resetProgressOffsetX();
                                currentInternalMonitor.sumProgressOffsetY(currentInternalChildVideoPanel.height);
                                /**
                                 * Debug
                                 */
                                //console.log('UGUALE');
                                //this.log(parentVideoPanel, currentInternalChildVideoPanel, currentInternalMonitor, resourceMosaic, crop.toString());
                                break;
                            /***
                             * TODO comment
                             */
                            case resourceMosaic.getRemainingWidth() > currentInternalMonitor.getRemainingWidth():
                                crop = new Crop(
                                    currentInternalMonitor.getRemainingWidth(),
                                    resourceMosaic.dimension.height,
                                    resourceMosaic.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(resourceMosaic, currentInternalMonitor.progressOffsetX, currentInternalMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                currentInternalChildVideoPanel.sumRemainingWidth(currentInternalMonitor.getRemainingWidth());
                                parentVideoPanel.sumRemainingWidth(currentInternalMonitor.getRemainingWidth());
                                resourceMosaic.sumRemainingWidth(currentInternalMonitor.getRemainingWidth());
                                currentInternalMonitor.resetProgressOffsetX();
                                currentInternalMonitor.sumProgressOffsetY(currentInternalChildVideoPanel.height);
                                /**
                                 * Debug
                                 */
                                // console.log('MAGGIORE');
                                //this.log(parentVideoPanel, currentInternalChildVideoPanel, currentInternalMonitor, resourceMosaic, crop.toString());
                                break;
                            /***
                             * TODO comment
                             */
                            case resourceMosaic.getRemainingWidth() <= currentInternalMonitor.getRemainingWidth():
                                crop = new Crop(
                                    resourceMosaic.getRemainingWidth(),
                                    resourceMosaic.dimension.height,
                                    resourceMosaic.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(resourceMosaic, currentInternalMonitor.progressOffsetX, currentInternalMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                currentInternalChildVideoPanel.sumRemainingWidth(resourceMosaic.getRemainingWidth());
                                parentVideoPanel.sumRemainingWidth(resourceMosaic.getRemainingWidth());
                                currentInternalMonitor.sumProgressOffsetX(resourceMosaic.getRemainingWidth());
                                resourceMosaic.sumRemainingWidth(resourceMosaic.getRemainingWidth());
                                /**
                                 * Debug
                                 */
                                //   console.log('MINORE');
                                // this.log(parentVideoPanel, currentInternalChildVideoPanel, currentInternalMonitor, resourceMosaic, crop.toString());
                                break;
                        }
                    }
                }
            }

            index++;
            currentInternalChildVideoPanel = panelMosaic.getVideoPanel().getVideoPanelByIndex(index);
            // If the length of the sub panel is less the parent length
            if (!currentInternalChildVideoPanel) {
                break;
            }

            currentInternalMonitor = virtualMonitorMosaic.getMonitor(currentInternalChildVideoPanel.virtualMonitorReference.monitorId);
            currentInternalMonitor.initMonitor();
            if (container.id === currentInternalMonitor.id) {
                currentInternalMonitor.progressOffsetY = 0;
            }
        }

        return mosaic.generate();
    }

    /**
     * @param {VirtualMonitor} virtualMonitor
     * @param {Panel} panelMosaic
     * @return {MonitorMosaic}
     */
    getMosaicMonitorContainer(virtualMonitor, panelMosaic) {

        let containerPanel = panelMosaic.getVideoPanel()
            .getVideoPanels({nested:true})
            .find((element) => {
                return element.singleResource === true;
            });

        if (!containerPanel) {
            containerPanel = panelMosaic.getVideoPanel();
        }

        return virtualMonitor.getMonitor(containerPanel.virtualMonitorReference.monitorId);
    }

    /**
     * @param {VideoPanelMosaic} container
     * @param {VideoPanelMosaic} child
     * @param {MonitorMosaic} currentMonitor
     * @param {ResourceMosaic} resource
     */
    log(container, child, currentMonitor, resource = null, cropString =null) {
        return;
        console.group('Cicle');
        console.log(
            'CONTAINER MOSAIC',
            'remaining',
            container.getRemainingWidth(),
            'width',
            container.width
        );

        console.log(
            'CHILD MOSAIC',
            child.name,
            'remaining',
            child.getRemainingWidth(),
            'width',
            child.width);

        console.log(
            'CHILD MONITOR',
            'width',
            currentMonitor.width,
            'height',
            currentMonitor.height,
            'remainingWidth',
            currentMonitor.getRemainingWidth()
          );

        console.log(
            'CHILD MONITOR OFFSET',
            'X',
            currentMonitor.getComputedOffsetX(),
            'Y',
            currentMonitor.offsetY,
            'progressY',
            currentMonitor.progressOffsetY,
            'progressX',
            currentMonitor.progressOffsetX
        );

        if (resource) {
            console.log(
                'RESOURCE',
                'width',
                resource.dimension.width,
                'height',
                resource.dimension.height,
                'computed',
                resource.getRemainingWidth(),
                'cropstring',
                cropString
            );
        }

        console.groupEnd();
    }
}

module.exports = VideoPanelResourceService;