/**
 *
 */
class PanelResource extends Panel {

    /**
     *
     */
    constructor() {

        super();

        /**
         * @type {null}
         */
        this.resourceReference = {};

        /**
         * @type {boolean}
         */
        this.nested = false;
    }
}

module.exports = PanelResource;