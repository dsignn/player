/**
 * @class ResourceMosaic
 */
class ResourceMosaic extends FileEntity {

    constructor() {
        super();

        /**
         * @type {Object}
         */
        this.dimension = {};

        /**
         * @type {number}
         */
        this.computedWidth = 0;
    }

    /**
     * @returns {Number}
     */
    getWidth() {
        return this.dimension.width;
    }

    /**
     * @returns {Number}
     */
    getHeight() {
        return this.dimension.height;
    }

    /**
     * @return {Number}
     */
    getRemainingWidth() {
        return this.getWidth() - this.computedWidth;
    }

    /**
     * @param {Number} addend
     * @return {ResourceMosaic}
     */
    sumRemainingWidth(addend) {
        this.computedWidth += addend;
        return this;
    }

    /**
     * @returns {ResourceMosaic}
     */
    resetComputedWidth() {
        this.computedWidth = 0;
        return this;
    }
}

module.exports = ResourceMosaic;