
class Video extends GenericFile {

    constructor() {
        super();
        this.duration = null;
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