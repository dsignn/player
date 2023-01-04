const VideoPanelContainerEntity = (async () => {       
      
    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));


    /**
     * @class VideoPanelContainerEntity
     */
    class VideoPanelContainerEntity extends EntityIdentifier {

        /**
         *
         */
        constructor() {

            super();

            /**
             * @type {null}
             */
            this.name = null;

            /**
             * @type {(VideoPanel|Object)}
             */
            this.videoPanel = {};
        }

        /**
         * @returns {(VideoPanel|null)}
         */
        getVideoPanel() {
            return this.videoPanel;
        }

        /**
         * @param {VideoPanel} videoPanel
         * @return {VideoPanelContainerEntity}
         */
        setVideoPanel(videoPanel) {

            this.videoPanel = videoPanel;
            return this;
        }

        /**
         * @return {boolean}
         */
        hasVideoPanel() {

            return Object.keys(this.videoPanel).length === 0 && this.videoPanel.constructor === Object ? false : true;
        }
    }

    return {VideoPanelContainerEntity: VideoPanelContainerEntity};
})();

export default VideoPanelContainerEntity;
export const then = VideoPanelContainerEntity.then.bind(VideoPanelContainerEntity);