/**
 *
 */
class LocationPath {

    /**
     * @param {string|null} name
     * @param {string|null} path
     */
    constructor(name = null, path = null) {

        /**
         * @type {string|null}
         */
        this.name = name;

        /**
         * @type {string|null}
         */
        this.path = path
    }

    /**
     * @return {boolean}
     */
    isAbsolute() {
        return require('path').isAbsolute(`${this.path}${this.name}`);
    }

    /**
     * @return {string}
     */
    getName() {
        return this.name;
    }

    /**
     * @return {string}
     */
    getPath() {
        return this.path;
    }
}

module.exports = LocationPath;