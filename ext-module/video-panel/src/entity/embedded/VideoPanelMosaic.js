const VideoPanelMosaic = (async () => {    

    const { VideoPanel } = await import(`./VideoPanel.js`);

    /**
     * @class VideoPanelMosaic
     */
    class VideoPanelMosaic extends VideoPanel {

        /**
         *
         */
        constructor() {
            super();

            /**
             * @type {Number|null}
             */
            this.computedWidth = 0;
        }

        /**
         * @return {Number}
         */
        getRemainingWidth() {
            return this.width - this.computedWidth;
        }

        /**
         * @param {Number} addend
         * @return {VideoPanelMosaic}
         */
        sumRemainingWidth(addend) {
            this.computedWidth += addend;
            return this;
        }
    }

    return {VideoPanelMosaic: VideoPanelMosaic};
})();

export default VideoPanelMosaic;
export const then = VideoPanelMosaic.then.bind(VideoPanelMosaic);