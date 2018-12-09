class MonitorMosaicWrapper extends Monitor {

    /**
     *
     */
    constructor() {
        super();

        /**
         * @type {Number}
         */
        this.progressOffsetX = null;

        /**
         * @type {Number}
         */
        this.progressOffsetY = null;
    }

    /**
     * @return {boolean}
     */
    isProgressOffsets() {
        return this.progressOffsetX !== null || this.progressOffsetY !== null;
    }

    /**
     * @return {Number}
     */
    getRemainingWidth() {
        return this.width - this.progressOffsetY;
    }
}

module.exports = MonitorMosaicWrapper;