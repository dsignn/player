const VideoPanelService = (async () => {      
    const { Crop } = await import(`./ffmpg/filter/Crop.js`);
    const { Mosaic } = await import(`./ffmpg/Mosaic.js`);
    
    /**
     * @class VideoPanelService
     */
    class VideoPanelService {

        /**
         *
         * @param {StorageInterface} storageMonitor
         * @param {StorageInterface} storageVideoPanel
         * @param {StorageInterface} storageResource
         * @param {HydratorInterface} monitorContainerMosaicHydrator
         * @param {HydratorInterface} videoPanelMosaicHydrator
         * @param {HydratorInterface} resourceMosaicHydrator
         * @param {ResourceService} resourceService
         */
        constructor(
            storageMonitor,
            storageVideoPanel,
            storageResource,
            monitorContainerMosaicHydrator,
            videoPanelMosaicHydrator,
            resourceMosaicHydrator,
            resourceService, 
            tmpDir
        ) {

            this.tmpDir = tmpDir;

            /**
             * @type {StorageInterface}
             */
            this.storageMonitor = storageMonitor;

            /**
             * @type {StorageInterface}
             */
            this.storageVideoPanel = storageVideoPanel;

            /**
             * @type {StorageInterface}
             */
            this.storageResource = storageResource;

            /**
             * @type {HydratorInterface}
             */
            this.monitorContainerMosaicHydrator = monitorContainerMosaicHydrator;

            /**
             * @type {HydratorInterface}
             */
            this.videoPanelMosaicHydrator = videoPanelMosaicHydrator;

            /**
             * @type {HydratorInterface}
             */
            this.resourceMosaicHydrator = resourceMosaicHydrator;

            /**
             * @type {ResourceService}
             */
            this.resourceService = resourceService;
        }

        /**
         * @param {VideoPanelResource} videoPanelResource
         * @param {PathInterface} locationPath
         * @return {Promise}
         */
        async generateResource(videoPanelResource, locationPath) {

            /**
             * @type {VideoPanelContainerEntity}
             *
             * Contains VideoPanelMosaic object
             */
            let videoPanelContainer = this.videoPanelMosaicHydrator.hydrate(
                await this.storageVideoPanel.get(videoPanelResource.videoPanelReference.parentId)
            );

            // TODO add controll
            /**
             * @type {MonitorContainerEntity}
             *
             * Contains MonitorMosaic object
             */
            let monitorContainerEntity = this.monitorContainerMosaicHydrator.hydrate(
                await this.storageMonitor.get(videoPanelContainer.getVideoPanel().monitorContainerReference.parentId)
            );

            // TODO add controll
            let index = 0;

            /**
             *  @type {VideoPanelMosaic}
             */
            let parentVideoPanelMosaic = videoPanelContainer.getVideoPanel().getVideoPanel(videoPanelResource.videoPanelReference.id);

            /**
             * @type {(VideoPanelMosaic|Object)}
             */
            let childVideoPanelMosaic = parentVideoPanelMosaic.videoPanels.length > index ? parentVideoPanelMosaic.videoPanels[index] : parentVideoPanelMosaic;

            /**
             * @type {MonitorMosaic}
             */
            let currentMonitor = monitorContainerEntity.getMonitor(
                childVideoPanelMosaic ? childVideoPanelMosaic.monitorContainerReference.id : parentVideoPanelMosaic.monitorContainerReference.id
            );
            currentMonitor.initMonitor();

            /**
             * @type {(VideoPanelResource|null)}
             */
            let currentVideoPanelResource = null;

            /**
             * @type {Mosaic}
             * */
            let mosaic = new Mosaic();
            let container = monitorContainerEntity.getMonitor(parentVideoPanelMosaic.monitorContainerReference.id);

            mosaic.setBasePanel(container.width, container.height, 'black');
            mosaic.setDestination(locationPath);

            let crop;
            let resources = [];
            let resource;
            /**
             * @type ResourceMosaic
             */
            let currentResource;
            let indexResource;

            while (parentVideoPanelMosaic.getRemainingWidth() > 0) {

                currentVideoPanelResource = videoPanelResource.getVideoPanel(childVideoPanelMosaic.id);
                if (currentVideoPanelResource.resources.length == 0) {

                    childVideoPanelMosaic.sumRemainingWidth(childVideoPanelMosaic.width);
                    parentVideoPanelMosaic.sumRemainingWidth(childVideoPanelMosaic.width);
                }

                indexResource = 0;
                crop = null;
                resources = await this._getResourceFromVideoPanel(currentVideoPanelResource);
                currentResource = resources[indexResource];
                currentResource.path.setDirectory(this.resourceService.getResourceDirectory(currentResource));
    /*
                if (index === 0) {
                    index++;
                    childVideoPanelMosaic = videoPanelContainer.getVideoPanel().getVideoPanelByIndex(index);
                    currentMonitor = monitorContainerEntity.getMonitor(childVideoPanelMosaic.monitorContainerReference.id);
                    currentMonitor.initMonitor();
                    continue;
                }
    */
                while (childVideoPanelMosaic.getRemainingWidth() > 0) {

                    this.log('CICLO', currentMonitor, parentVideoPanelMosaic, childVideoPanelMosaic, currentResource, crop);
                    while (currentResource.getRemainingWidth() > 0 && childVideoPanelMosaic.getRemainingWidth() > 0) {

                        /**
                         * START SIMULATION
                         */
                    // childVideoPanelMosaic.sumRemainingWidth(currentResource.getWidth());
                    // parentVideoPanelMosaic.sumRemainingWidth(currentResource.getWidth());
                    // currentResource.sumRemainingWidth(currentResource.getWidth());
                        /**
                         * END SIMULATION
                         */

                        switch (true) {

                            /**
                             * Must be the end of the last row
                             */
                            case (currentMonitor.getRemainingWidth() >= childVideoPanelMosaic.getRemainingWidth() && currentResource.getRemainingWidth() >= childVideoPanelMosaic.getRemainingWidth()):
                                crop = new Crop(
                                    childVideoPanelMosaic.getRemainingWidth(),
                                //    currentResource.dimension.height,
                                    childVideoPanelMosaic.height,
                                    currentResource.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(currentResource, currentMonitor.progressOffsetX, currentMonitor.progressOffsetY, crop);

                                /**
                                 * Calc next step
                                 */
                                parentVideoPanelMosaic.sumRemainingWidth(childVideoPanelMosaic.getRemainingWidth());
                                currentResource.sumRemainingWidth(childVideoPanelMosaic.getRemainingWidth());
                                childVideoPanelMosaic.sumRemainingWidth(childVideoPanelMosaic.getRemainingWidth());
                                /**
                                 * Debug
                                 */
                                console.log('END ROW');
                        //     this.log('LAST ROW', currentMonitor, parentVideoPanelMosaic, childVideoPanelMosaic, currentResource, crop);
                                break;
                            /**
                             * The width of the video resource it's the same of the end on the monitor
                             */
                            case currentResource.getRemainingWidth() === currentMonitor.getRemainingWidth():
                                crop = new Crop(
                                    currentResource.getRemainingWidth(),
                        //         currentResource.dimension.height,
                                    childVideoPanelMosaic.height,
                                    currentResource.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(currentResource, currentMonitor.progressOffsetX, currentMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                childVideoPanelMosaic.sumRemainingWidth(currentMonitor.getRemainingWidth());
                                parentVideoPanelMosaic.sumRemainingWidth(currentMonitor.getRemainingWidth());
                                currentResource.sumRemainingWidth(currentMonitor.getRemainingWidth());
                                currentMonitor.resetProgressOffsetX();
                                currentMonitor.sumProgressOffsetY(childVideoPanelMosaic.height);
                                /**
                                 * Debug
                                 */
                                console.log('END MONITOR');
                        //        this.log('END MONITOR', currentMonitor, parentVideoPanelMosaic, childVideoPanelMosaic, currentResource, crop);
                                break;
                            /**
                             * The width of the resource is bigger than the width of th remaing monitor width
                             */
                            case currentResource.getRemainingWidth() > currentMonitor.getRemainingWidth():
                                crop = new Crop(
                                    currentMonitor.getRemainingWidth(),
                                //   currentResource.dimension.height,
                                    childVideoPanelMosaic.height,
                                    currentResource.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(currentResource, currentMonitor.progressOffsetX, currentMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                childVideoPanelMosaic.sumRemainingWidth(currentMonitor.getRemainingWidth());
                                parentVideoPanelMosaic.sumRemainingWidth(currentMonitor.getRemainingWidth());
                                currentResource.sumRemainingWidth(currentMonitor.getRemainingWidth());
                                currentMonitor.resetProgressOffsetX();
                                currentMonitor.sumProgressOffsetY(childVideoPanelMosaic.height);
                                /**
                                 * Debug
                                 */
                                console.log('A CAPO');
                        //     this.log('RESOURCE BIGGER THEN MONITOR', currentMonitor, parentVideoPanelMosaic, childVideoPanelMosaic, currentResource, crop);
                                break;
                            /***
                             * TODO comment
                             */
                            case currentResource.getRemainingWidth() <= currentMonitor.getRemainingWidth():
                                crop = new Crop(
                                    currentResource.getRemainingWidth(),
                            //      currentResource.dimension.height,
                                    childVideoPanelMosaic.height,
                                    currentResource.computedWidth,
                                    0
                                );
                                /**
                                 * Add Resource
                                 */
                                mosaic.addResource(currentResource, currentMonitor.progressOffsetX, currentMonitor.progressOffsetY, crop);
                                /**
                                 * Calc next step
                                 */
                                childVideoPanelMosaic.sumRemainingWidth(currentResource.getRemainingWidth());
                                parentVideoPanelMosaic.sumRemainingWidth(currentResource.getRemainingWidth());
                                currentMonitor.sumProgressOffsetX(currentResource.getRemainingWidth());
                                currentResource.sumRemainingWidth(currentResource.getRemainingWidth());
                                /**
                                 * Debug
                                 */
                                console.log('CONTENUTA');
                            //    this.log('RESOURCE SMALLEST THEN MONITOR', currentMonitor, parentVideoPanelMosaic, childVideoPanelMosaic, currentResource, crop);
                                break;
                        }
                    }

                    indexResource = resources.length > (indexResource+1) ? indexResource + 1 : 0;
                    currentResource.resetComputedWidth();
                    currentResource = resources[indexResource];
                }


                if (parentVideoPanelMosaic.videoPanels.length > 0) {
                    index++;
                    childVideoPanelMosaic = videoPanelContainer.getVideoPanel().getVideoPanelByIndex(index);
                    if (!childVideoPanelMosaic) {
                        break;
                    }

                    currentMonitor = monitorContainerEntity.getMonitor(childVideoPanelMosaic.monitorContainerReference.id);
                    currentMonitor.initMonitor();
                    if (container.id === currentMonitor.id) {
                        currentMonitor.progressOffsetY = 0;
                    }
                }
            }

            return mosaic.generate();
        }

        /**
         * @param {VideoPanelResource} videoPanel
         * @returns {Promise}
         * @private
         */
        _getResourceFromVideoPanel(videoPanel) {
            let promises = [];
            for (let cont = 0; videoPanel.resources.length > cont; cont++) {
                promises.push(
                    this._getResourceMosaic(videoPanel.resources[cont].id)
                )
            }
            return Promise.all(promises);
        }

        /**
         * @param {string} id
         * @returns {Promise}
         * @private
         */
        _getResourceMosaic(id) {
            return new Promise((resolve) => {
                this.storageResource.get(id)
                    .then((resource) => {
                        resolve(this.resourceMosaicHydrator.hydrate(resource))
                    })
                    .catch(() => {
                        resolve({})
                    });
            });
        }

        /**
         * @param {string} label
         * @param {MonitorMosaic} monitor
         * @param {VideoPanelMosaic} fatherVideoPanel
         * @param {VideoPanelMosaic} childVideoPanel
         * @param {ResourceMosaic} resourceMosaic
         * @param {ResourceMosaic} cropString
         */
        log(label, monitor, fatherVideoPanel, childVideoPanel, resourceMosaic = null, cropString = null) {

            console.group(label);

            console.groupCollapsed(`MONITOR ${ monitor.name}` );
                console.log('Remaining',    monitor.getRemainingWidth());
                console.log('Width',    monitor.width);
                console.log('Progress x',    monitor.progressOffsetX);
                console.log('Progress y',    monitor.progressOffsetY);
                console.log('Object',    monitor);
            console.groupEnd();

            console.groupCollapsed(`VIDEO PANEL FATHER ${fatherVideoPanel.name}` );
                console.log('Remaining', fatherVideoPanel.getRemainingWidth());
                console.log('Width', fatherVideoPanel.width);
                console.log('Object',    fatherVideoPanel);
            console.groupEnd();

            console.groupCollapsed(`VIDEO PANEL CHILD ${childVideoPanel.name}` );
                console.log('Remaining', childVideoPanel.getRemainingWidth());
                console.log('Width', childVideoPanel.width);
                console.log('Object',    childVideoPanel);
            console.groupEnd();


            if (resourceMosaic) {

                console.groupCollapsed(`CURRENT RESOURCE ${resourceMosaic.name}`);
                    console.log('Remaining', resourceMosaic.getRemainingWidth());
                    console.log('Width', resourceMosaic.dimension.width);
                    console.log('Height', resourceMosaic.dimension.height);
                    console.log('Object',    resourceMosaic);
                console.groupEnd();
            }

            console.groupEnd();
        }
    }

    return {VideoPanelService: VideoPanelService};
})();

export default VideoPanelService;
export const then = VideoPanelService.then.bind(VideoPanelService);