/**
 * @class Injector
 */
export class Injector {

    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {Object}
         */
        this.data = {};
    }

    /**
     * @param {object} data
     */
    setData(data) {
        this.data = data;
    }

    /**
     * @param {string} name
     */
    setName(name) {
        this.name = name;
    }
}
