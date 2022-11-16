const VideoPanelResourceContainerEntity = (async () => {        
   
    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    /**
     * @class VideoPanelResourceContainerEntity
     */
    class VideoPanelResourceContainerEntity extends EntityIdentifier {

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
             * @type {(EntityReference|Object)}
             */
            this.resourceReference = {};

            /**
             * @type {(VideoPanelResource|Object)}
             */
            this.videoPanelResource = {};
        }

        /**
         * @returns {(VideoPanelResource|object)}
         */
        getVideoPanelResource() {
            return this.videoPanelResource;
        }

        /**
         * @param {VideoPanelResource} videoPanelResource
         * @return {VideoPanelResourceContainerEntity}
         */
        setVideoPanelResource(videoPanelResource) {

            this.videoPanelResource = videoPanelResource;
            return this;
        }

        /**
         * @return {boolean}
         */
        hasVideoPanelResource() {

            return Object.keys(this.videoPanelResource).length === 0 && this.videoPanelResource.constructor === Object ? false : true;
        }
    }
    return {VideoPanelResourceContainerEntity: VideoPanelResourceContainerEntity};
})();

export default VideoPanelResourceContainerEntity;
export const then = VideoPanelResourceContainerEntity.then.bind(VideoPanelResourceContainerEntity);