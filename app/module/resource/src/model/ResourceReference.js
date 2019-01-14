
class ResourceReference {

    /**
     *
     * @param {string} id
     * @param {string} name
     */
    constructor(id = null, name = null) {

        /**
         * @type {null|string}
         */
        this.referenceId = id;

        /**
         * @type {null|string}
         */
        this.name = name;
    }
}

module.exports = ResourceReference;