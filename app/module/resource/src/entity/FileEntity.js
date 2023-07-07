import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";
import {FilterMixin} from './mixin/FilterMixin';
import {PlayerPropertyAwareMixin} from './mixin/PlayerPropertyAwareMixin';
import {MonitorPropertyAwareMixin} from './../../../monitor/src/entity/mixin/MonitorPropertyAwareMixin';


/**
 * @class FileEntity
 */
export class FileEntity extends MonitorPropertyAwareMixin(PlayerPropertyAwareMixin(FilterMixin(EntityIdentifier))) {

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
