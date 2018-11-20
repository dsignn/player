/**
 *
 */
class SidelineMosaic {

    /**
     *
     */
    constructor(sideline, resourceHydrator) {

        this.ffmpeg = require('fluent-ffmpeg');
        this.hidrator = resourceHydrator;

        this.name = null;
        this.extension = 'mp4';

        this._sideline = sideline;
        this._sidelineMonitorIndex = 0;
        this._remainingWidth = sideline.width;



        this.currentXOffset = 0;
        this.currentYOffset = 0;
        if (sideline.sidelines && Array.isArray(sideline.sidelines) && sideline.sidelines.length > 0 && sideline.sidelines[0].monitor) {
            this.currentXOffset = sideline.sidelines[0].monitor.offsetX;
            this.currentYOffset = sideline.sidelines[0].monitor.offsetY;
            this.currentSidelineRemainingWidth = sideline.sidelines[0].width;
        }

        this.currentResource = null;
        this.resourceRemainingWidth = null;

        this.inputs = [];

        this._complexFilter = {
            base : null,
            filter : [],
            overlay :[]
        };

        this._filterIndex = 0;
        this._overlayIndex = 0;

        /**
         * @type {string}
         */
        this.path = 'app/storage/tmp/'
    }

    /**
     * @param path
     * @returns {SidelineMosaic}
     */
    setPath(path) {
        this.path = path;
        return this;
    }

    /**
     * @returns {Number}
     */
    getHeight() {
        return this._sideline.monitor.height;
    }

    /**
     * @returns {Number}
     */
    getWidth() {
        return this._sideline.monitor.width;
    }

    /**
     * @returns {Number}
     */
    getRemainingWidth() {
        return this._remainingWidth;
    }

    /**
     * @returns {null}
     */
    getCurrentSideline() {
        return this._sideline.sidelines[this._sidelineMonitorIndex] ? this._sideline.sidelines[this._sidelineMonitorIndex] : null;
    }

    /**
     * @returns {boolean}
     */
    hasNextSideline() {
        return !!this._sideline.sidelines[this._sidelineMonitorIndex + 1];
    }

    /**
     * @param {String} baseString
     */
    setBaseComplexFilter(baseString = '') {
        this._complexFilter.base = `${baseString} [base0]`;
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
     * @param resource
     * @returns {SidelineMosaic}
     */
    setCurrentResource(resource) {
        this.currentResource = this.hidrator.hydrate(resource);
        this.resourceRemainingWidth = this.currentResource.getWidth();
        return this;
    }

    /**
     * @returns {SidelineMosaic}
     */
    clearCurrentResource() {
        this.currentResource = null;
        this.resourceRemainingWidth = null;
        return this;
    }

    /**
     * @returns {Number|null}
     */
    getCurrentResourceComputedWidth() {

        if (this.resourceRemainingWidth === null || this.currentResource === null) {
            return null;
        }

        return this.currentResource.getWidth() - this.resourceRemainingWidth;
    }

    /**
     * @param resource
     */
    addResource(resource) {

        this.setCurrentResource(resource);
        let chunk = 0;

        while (this.resourceRemainingWidth > 0 && this._remainingWidth > 0)  {

            let sideline = this.getCurrentSideline();

            switch (true) {

                case this.resourceRemainingWidth >= sideline.monitor.width && sideline.monitor.width < this._sideline.monitor.width:
                    //this.consoleLog('CROP AFTER', sideline);
                    // Length of the resource in the mosaic
                    chunk = sideline.monitor.width-this.currentXOffset;

                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`crop=${chunk}:${sideline.monitor.height}:${this.getCurrentResourceComputedWidth()}:0`);
                    this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);

                    if (this.hasNextSideline()) {
                        this._sidelineMonitorIndex++;
                        this.currentYOffset = this.getCurrentSideline().monitor.offsetY;
                        this.currentXOffset = this.getCurrentSideline().monitor.offsetX;
                        this.currentSidelineRemainingWidth = this.getCurrentSideline().width;
                    }
                    this.resourceRemainingWidth -= chunk;
                    this._remainingWidth -= chunk;
                    this.consoleLog('CROP POST', sideline);
                    break;
                case this.resourceRemainingWidth >= sideline.monitor.width:
                case this.currentXOffset + this.resourceRemainingWidth > sideline.monitor.width:
                    //this.consoleLog('SBORDA AFTER', sideline);
                    // Length of the resource in the mosaic
                    chunk = this.getOverflowComputedWidth(sideline);

                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`crop=${chunk}:${sideline.height}:${this.getCurrentResourceComputedWidth()}:0`);
                    this.appendOverlayComplexFilter(this.currentXOffset, this.currentYOffset);

                    // Calc next step
                    this.resourceRemainingWidth -= chunk;
                    this.currentXOffset = sideline.monitor.offsetX;
                    this.currentYOffset += this._sideline.height;

                    let sidelineMonitorIndex = this._sidelineMonitorIndex;
                    this._sidelineMonitorIndex = this.currentYOffset < (sideline.monitor.height + sideline.monitor.offsetY) ? this._sidelineMonitorIndex : this._sidelineMonitorIndex +1;
                    if (this._sidelineMonitorIndex === sidelineMonitorIndex) {
                        this.currentSidelineRemainingWidth -= chunk;
                    } else if (this.hasNextSideline()) {
                        this.currentSidelineRemainingWidth = this.getCurrentSideline().width;
                    }

                    this._remainingWidth -= chunk;
                    this.consoleLog('SBORDA POST', sideline);
                    break;
                case this.resourceRemainingWidth < sideline.monitor.width:
                    //this.consoleLog('RIEMPIRE AFTER', sideline);

                    this.inputs.push(this.currentResource);
                    this.appendFilterComplexFilter(`setpts=PTS-STARTPTS`);
                    this.appendOverlayComplexFilter(this.currentXOffset - (this.getCurrentResourceComputedWidth()), this.currentYOffset);

                    // Calc next step
                    this.currentSidelineRemainingWidth -= this.resourceRemainingWidth;
                    this._remainingWidth -= this.currentResource.getWidth() - this.getCurrentResourceComputedWidth();
                    this.currentXOffset += this.resourceRemainingWidth;
                    this.resourceRemainingWidth = 0;
                    this.consoleLog('RIEMPIRE POST', sideline);
                    break;
                default:
                    this.consoleLog('DEFAULT');
                    throw 'No good';

            }
        }
        console.log('FINISH RESOURCE');

        this.clearCurrentResource();
    }

    /**
     * @param sideline
     */
    getOverflowComputedWidth(sideline) {
        return this.currentSidelineRemainingWidth < sideline.monitor.width && this.currentSidelineRemainingWidth > 0 ?
            this.currentSidelineRemainingWidth :
            (sideline.monitor.width - this.currentXOffset);
    }

    consoleLog(name, sideline) {
        console.group(name);
        console.log('getOverflowComputedWidth', this.getOverflowComputedWidth(sideline));
        console.log('getCurrentResourceComputedWidth', this.getCurrentResourceComputedWidth());
        console.log('currentYOffset', this.currentYOffset);
        console.log('currentXOffset', this.currentXOffset);
        console.log('_sidelineMonitorIndex', this._sidelineMonitorIndex);
        console.log('resourceRemainingWidth', this.resourceRemainingWidth);
        console.log('_remainingWidth',  this._remainingWidth);
        console.log('currentSidelineRemainingWidth',  this.currentSidelineRemainingWidth);
        console.groupEnd();
    }

    /**
     * @param name
     * @returns {FfmpegCommand}
     */
    generateVideo(name) {

        this.name = name;
        let command = new this.ffmpeg();
        let complexFilter = [];

        for (let cont = 0; this.inputs.length > cont; cont++) {
            command.addInput(this.inputs[cont].getPath());
        }

        complexFilter.push(this._complexFilter.base);

        for (let cont = 0; this._complexFilter.filter.length > cont; cont++) {
            complexFilter.push(this._complexFilter.filter[cont]);
        }

        for (let cont = 0; this._complexFilter.overlay.length > cont; cont++) {
            complexFilter.push(this._complexFilter.overlay[cont]);
        }

        console.log('COMPLEX FILTER', complexFilter);

        return command.complexFilter(complexFilter, `overlay${this._overlayIndex}`)
            .save(`${this.path}${name}.${this.extension}`);
    }

    /**
     * @returns {Object}
     */
    getLocation() {
        let location = {
            path: this.path
        };

        if(this.name) {
            location.name = `${this.name}.${this.extension}`;
        }
        return location;
    }

    __TEST() {
        // VIDEO FROM IMAGE
        // ffmpeg -loop 1 -t 15 -r 60 -s 1600x90 -i arcobaleno.png  -vcodec libx264 -crf 25 -pix_fmt yuv420p test.mp4
    }
}

module.exports = SidelineMosaic;