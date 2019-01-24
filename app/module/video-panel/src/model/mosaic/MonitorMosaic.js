class MonitorMosaic extends Monitor {

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
     * @return {MonitorMosaic}
     */
    initMonitor() {
        this.progressOffsetX = this.getComputedOffsetX();
        this.progressOffsetY = this.offsetY;
        return this;
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
        return this.width - this.progressOffsetX;
    }

    /**
     * @return {Number}
     */
    getComputedOffsetX() {

        let computedX = this.offsetX;
        if (this.polygon) {
            try {
                let polygonOffsetX = parseInt(this.polygon.split(' ')[0].replace('px', ''));
                computedX = computedX + polygonOffsetX;
            } catch (e) {
                console.error(e);
            }

        }

        return computedX;
    }

    /**
     * @return {MonitorMosaic}
     */
    resetProgressOffsetX() {
        this.progressOffsetX = this.offsetX;
        return this;
    }

    /**
     * @return {number}
     */
    getRemainingWidth() {
        return (this.width + this.offsetX) - this.progressOffsetX;
    }

    /**
     * @param addend
     * @return {MonitorMosaic}
     */
    sumProgressOffsetX(addend) {
        this.progressOffsetX += addend;
        return this;
    }

    /**
     * @param addend
     * @return {MonitorMosaic}
     */
    sumProgressOffsetY(addend) {
        this.progressOffsetY += addend;
        return this;
    }
}

module.exports = MonitorMosaic;