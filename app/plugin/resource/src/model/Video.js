
class Video extends GenericFile {

    constructor() {
        super();

        /**
         * @type {Number|null}
         */
        this.duration = null;

        /**
         * @type {Object}
         */
        this.dimension = {};

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'video'}
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
}

module.exports = Video;