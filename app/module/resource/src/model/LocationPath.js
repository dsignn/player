
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
    getFullName() {
        return this.name;
    }

    /**
     * @return {string}
     */
    getPath() {
        return this.path;
    }

    /**
     * @param path
     * @return {LocationPath}
     */
    setPath(path) {
        this.path = path;
        return this;
    }

    /**
     * @return {*}
     */
    getExtension() {
        let extension = null;
        if (this.name) {
            let split = this.name.split('.');
            extension = split.length > 1 ? split[1] : extension;
        }
        return extension;
    }

    /**
     * @return {string}
     */
    getName() {
        return this.name.split('.')[0];
    }

    /*
     * @return {string}
     */
    getFullPath() {
        return `${this.path}/${this.name}`;
    }
}

module.exports = LocationPath;