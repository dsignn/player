class ResourceMosaic extends GenericFile {

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

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'resourceMosaic'}
        );
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
}

module.exports = ResourceMosaic;