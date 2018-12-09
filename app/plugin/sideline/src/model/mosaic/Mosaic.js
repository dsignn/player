/**
 *
 */
class Mosaic {

    /**
     * @param {MonitorMosaicWrapper} monitorMosaicWrapper
     * @param {SidelineMosaicWrapper} sidelineMosaicWrapper
     * @param backgroundColor
     */
    constructor(monitorMosaicWrapper, sidelineMosaicWrapper, backgroundColor = 'black') {

        let ffmpeg = require('fluent-ffmpeg');
        this.command = new ffmpeg();

        /**
         * @type {MonitorMosaicWrapper}
         * @private
         */
        this._monitorMosaicWrapper = monitorMosaicWrapper;

        /**
         * @type {SidelineMosaicWrapper}
         * @private
         */
        this._sidelineMosaicWrapper= sidelineMosaicWrapper;

        /**
         * @type String
         */
        this.backgroundColor = backgroundColor;

        /**
         * @type {number}
         * @private
         */
        this._index = 0;

        /**
         * @type {Array}
         * @private
         */
        this._inputs = [];

        /**
         * @type {number}
         * @private
         */
        this._filterIndex = 0;

        /**
         * @type {number}
         * @private
         */
        this._overlayIndex = 0;

        /**
         * @type {Array}
         * @private
         */
        this._complexFilter = [
            `color=s=${this._monitorMosaicWrapper.width}x${this._monitorMosaicWrapper.width}:c=${this.backgroundColor}:d=15 [base${this._index}]`
        ];
    }

    /**
     * @return {MonitorMosaicWrapper}
     */
    getMonitorMosaicWrapper() {
        return this._monitorMosaicWrapper;
    }

    /**
     * @return {SidelineMosaicWrapper}
     */
    getSidelineMosaicWrapper() {
        return this._sidelineMosaicWrapper;
    }

    /**
     * @param {ResourceMosaic} resource
     * @param sideline
     */
    addResource(resource, sideline) {

        let wrapSideline = this._sidelineMosaicWrapper.getSideline(sideline.id);
        let wrapMonitor = this._monitorMosaicWrapper.getMonitor(wrapSideline.virtualMonitorReference.monitorId);

        if (!wrapMonitor.isProgressOffsets()) {
            this._initializeXY(wrapMonitor.id);
            console.log('INITIALIZE', wrapMonitor);
        }

        while (resource.isComputed()) {

            console.table(
                {
                    'resource remaining width' : resource.getRemainingWidth(),
                    'monitor remaining width' : wrapMonitor.getRemainingWidth()
                }
            );

            switch (true) {
                case resource.getRemainingWidth() > wrapMonitor.getRemainingWidth():
                    console.log('maggiore');
                    this.appendResource(resource);
                    //this.appendFilterComplexFilter(`crop=${chunk}:${sideline.monitor.height}:${this.getCurrentResourceComputedWidth()}:0`);
                   // this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);
                    break;
                case resource.getRemainingWidth() === wrapMonitor.getRemainingWidth():
                    console.log('uguale');
                    this.appendResource(resource);
                    //this.appendFilterComplexFilter(`crop=${chunk}:${sideline.monitor.height}:${this.getCurrentResourceComputedWidth()}:0`);
                    // this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);
                    break;
            }

            resource.computedWidth += (resource.dimension.width / 3);

        }

    }

    /**
     * @param {string} id
     * @private
     */
    _initializeXY(id) {

        let wrapMonitor = this._monitorMosaicWrapper.getMonitor(id);

        wrapMonitor.progressOffsetX = 0;
        wrapMonitor.progressOffsetY = 0;
        let parent = this._monitorMosaicWrapper.getParent(wrapMonitor.id);

        // Retrive parent monitor offset and skip last
        while (this._monitorMosaicWrapper.getParent(parent.id)) {
            wrapMonitor.progressOffsetX =+ parent.offsetX;
            wrapMonitor.progressOffsetY =+ parent.offsetY;
            parent = this._monitorMosaicWrapper.getParent(parent.id);
        }

        let monitor = this._monitorMosaicWrapper.getMonitor(wrapMonitor.id);

        wrapMonitor.progressOffsetX =+ monitor.offsetX;
        wrapMonitor.progressOffsetY =+ monitor.offsetY;
    }

    /***
     * @param {ResourceMosaic} resource
     */
    appendResource(resource) {
        this.command.addInput(resource.getPath());
    }

    /**
     * @param filter
     */
    appendFilterComplexFilter(filter) {
        this._complexFilter.filter.push({
            filter: filter,
            inputs: `${this._filterIndex}:v`,
            outputs: `filter${this._filterIndex}`
        });
        this._filterIndex++;
    }

    /**
     * @param startTarget
     * @param lastTarget
     * @param x
     * @param y
     */
    appendOverlayComplexFilter(x, y) {
        this._complexFilter.overlay.push({
            filter: 'overlay',
            options:  { shortest:1, x: x, y:  y},
            inputs: [this._overlayIndex !== 0 ? `overlay${this._overlayIndex}` : 'base0', `filter${this._filterIndex - 1}`],
            outputs: `overlay${this._overlayIndex + 1}`
        });
        this._overlayIndex++;
    }

    /**
     *
     */
    generate() {

        this.command
            .complexFilter(this._complexFilter, `base${this._index}`)
            .save('test/TONI.mp4')
            .on('error', function(err) {
                console.log(err.message);
            })
            .on('progress', () =>{
                console.log('in progress')
            })
            .on('end', function(data) {
                console.log('complete');
            });
    }

}

module.exports = Mosaic;