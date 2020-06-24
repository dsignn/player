import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class FileEntity
 */
export class FileEntity extends EntityIdentifier {

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
         * @type {PathInterface}
         */
        this.path;

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
