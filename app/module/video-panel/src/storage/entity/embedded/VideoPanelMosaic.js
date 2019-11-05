/**
 * @class VideoPanelMosaic
 */
class VideoPanelMosaic extends VideoPanel {

    /**
     *
     */
    constructor() {
        super();

        /**
         * @type {Number|null}
         */
        this.computedWidth = 0;
    }

    /**
     * @return {Number}
     */
    getRemainingWidth() {
        return this.width - this.computedWidth;
    }

    /**
     * @param {Number} addend
     * @return {VideoPanelMosaic}
     */
    sumRemainingWidth(addend) {
        this.computedWidth += addend;
        return this;
    }
}

module.exports = VideoPanelMosaic;