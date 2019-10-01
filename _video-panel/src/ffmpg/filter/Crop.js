/**
 *
 */
class Crop {

    /**
     * @param {Number} width
     * @param {Number} height
     * @param {Number} x
     * @param {Number} y
     */
    constructor(width, height, x, y) {

        /**
         * @type {Number}
         */
        this.width = width;

        /**
         * @type {Number}
         */
        this.height = height;

        /**
         * @type {Number}
         */
        this.x  = x;

        /**
         * @type {Number}
         */
        this.y = y;
    }

    /**
     * @return {string}
     */
    toString() {
        return  `crop=${this.width}:${this.height}:${this.x}:${this.y}`;
    }
}

module.exports = Crop;