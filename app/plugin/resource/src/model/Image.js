
class Image extends GenericFile {

    constructor() {
        super();
        this.dimension = {};

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'image'}
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

module.exports = Image;