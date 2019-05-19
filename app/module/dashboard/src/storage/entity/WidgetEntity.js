/**
 *
 */
class WidgetEntity  extends require("@dsign/library").storage.entity.EntityIdentifier  {

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
        this.height = 3;
        /**
         * @type {number}
         */
        this.width = 4;
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

module.exports = WidgetEntity;
