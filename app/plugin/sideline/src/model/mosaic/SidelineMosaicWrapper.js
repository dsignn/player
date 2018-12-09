class SidelineMosaicWrapper extends Sideline {

    /**
     *
     */
    constructor() {
        super();

        /**
         * @type {Number|null}
         */
        this.comutedWidth = 0;
    }

    /**
     * @return {Number}
     */
    getRemainingWidth() {
        return this.width - this.comutedWidth;
    }
}

module.exports = SidelineMosaicWrapper;