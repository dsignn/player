/**
 *
 */
class SourcePath {

    /**
     * @param {string} src
     */
    constructor(src) {

        /**
         * @type {string}
         * @private
         */
        this._src = src;
    }

    /**
     * @return {string}
     */
    getSource() {
        return this._src;
    }
}

module.exports = SourcePath;