
class FileEntity extends require("@p3e/library").storage.entity.EntityIdentifier {

    constructor() {
        super();

        /**
         * @type {string|null}
         */
        this.name = null;

        /**
         * @type {Number|null}
         */
        this.size = null;

        /**
         * @type {null}
         */
        this.type = null;

        /**
         * @type {Path}
         */
        this.path = new (require("@p3e/library").path.Path)();

        /**
         * @type {Array}
         */
        this.tags = [];
    }

    /**
     * @returns {string|null}
     */
    computeName() {
        return `${this.path.nameFile}.${this.path.extension}`;
    }
}

module.exports = FileEntity;