/**
 *
 */
class Mosaic {

    /**
     * @param {Sideline} sideline
     * @param {Monitor} monitor
     * @param backgroundColor
     */
    constructor(monitor, sideline, backgroundColor = 'black') {

        let ffmpeg = require('fluent-ffmpeg');
        this.command = new ffmpeg();

        /**
         * @type {Monitor}
         * @private
         */
        this._monitor = monitor;

        /**
         * @type {Sideline}
         * @private
         */
        this._sideline = sideline;

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
            `color=s=${this._monitor.width}x${this._monitor.width}:c=${this.backgroundColor}:d=15 [base${this._index}]`
        ];
    }

    /**
     * @param resource
     * @param sideline
     */
    addResource(resource, sideline) {

        let wrapSideline = this._sideline.getSideline(sideline.id);

        if (wrapSideline.offsetX === undefined || wrapSideline.offsetY === undefined) {
            this._initializeXY(wrapSideline);
        }

        switch (true) {

        }
    }

    /**
     * @param wrapSideline
     * @return {*}
     * @private
     */
    _initializeXY(wrapSideline) {

        wrapSideline.offsetX = 0;
        wrapSideline.offsetY = 0;
        let parent = this._monitor.getParent(wrapSideline.virtualMonitorReference.monitorId);

        // Retrive parent monitor and skip last
        while (this._monitor.getParent(parent.id)) {
            wrapSideline.offsetX =+ parent.offsetX;
            wrapSideline.offsetY =+ parent.offsetY;
            parent = this._monitor.getParent(parent.id);
        }

        let monitor = this._monitor.getMonitor(wrapSideline.virtualMonitorReference.monitorId);

        wrapSideline.offsetX =+ monitor.offsetX;
        wrapSideline.offsetY =+ monitor.offsetY;

        return wrapSideline;
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