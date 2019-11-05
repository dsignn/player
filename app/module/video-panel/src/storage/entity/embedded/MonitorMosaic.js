/**
 * @class MonitorMosaic
 */
class MonitorMosaic extends MonitorEntity {

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
        this.progressOffsetX = this._getComputedOffsetX();
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
    _getComputedOffsetX() {

        let offsetX = 0;
        let points;

        if (this.polygonPoints.length === 8 || this.polygonPoints.length === 6) {

            points = this.polygonPoints.concat([]);
            /**
             * Sort points by y and x
             */
            points.sort((point1, point2) => {

                if (point1.y < point2.y) {
                    return -1;
                }

                if (point1.y > point2.y) {
                    return 1;
                }

                if (point1.y === point2.y) {

                    if (point1.x < point2.x) {
                        return -1;
                    }

                    if (point1.x > point2.x) {
                        return 1;
                    }

                    return 0
                }
            });

            if (this.polygonPoints.length === 8) {

                if (points[0].x === points[3].x) {
                    offsetX = points[0].x;
                } else {
                    console.warn('Wrong length 8 polygon', this);
                }
            }

            if (this.polygonPoints.length === 6) {
                if (points[0].x === points[3].x && points[3].y !== this.height) {
                    offsetX = points[0].x;
                }
            }

        } else {
            console.warn('Wrong length polygon', this);
        }

        return offsetX;
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