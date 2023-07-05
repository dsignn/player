import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";
import {FilterMixin} from './mixin/FilterMixin';

/**
 * @class FileEntity
 */
export class FileEntity extends FilterMixin(EntityIdentifier) {

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

        /**
         * @type {string}
         */
        this.checksum;
    }

    /**
     * @returns {string|null}
     */
    computeName() {
        return `${this.path.nameFile}.${this.path.extension}`;
    }
}
