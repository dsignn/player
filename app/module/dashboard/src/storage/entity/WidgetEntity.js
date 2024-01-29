import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class WidgetEntity
 */
export class WidgetEntity  extends EntityIdentifier  {

    constructor() {
        super();

        /**
         * @type {number}
         */
        this.col = 0;
        /**
         * @type {number}
         */
        this.row = 0;
        /**
         * @type {number}
         */
        this.height = 160;
        /**
         * @type {number}
         */
        this.width = 120;
        /**
         * @type {string}
         */
        this.wc = '';
        /**
         * @type {Object}
         */
        this.data = {};
    }
}