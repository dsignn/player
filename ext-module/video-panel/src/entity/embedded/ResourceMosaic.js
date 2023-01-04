const ResourceMosaic = (async () => {        

    const { FileEntity } = await import(`${container.get('Application').getBasePath()}module/resource/src/entity/FileEntity.js`);

    /**
     * @class ResourceMosaic
     */
    class ResourceMosaic extends FileEntity {

        constructor() {
            super();

            /**
             * @type {Object}
             */
            this.dimension = {};

            /**
             * @type {number}
             */
            this.computedWidth = 0;
        }

        /**
         * @returns {Number}
         */
        getWidth() {
            return this.dimension.width;
        }

        /**
         * @returns {Number}
         */
        getHeight() {
            return this.dimension.height;
        }

        /**
         * @return {Number}
         */
        getRemainingWidth() {
            return this.getWidth() - this.computedWidth;
        }

        /**
         * @param {Number} addend
         * @return {ResourceMosaic}
         */
        sumRemainingWidth(addend) {
            this.computedWidth += addend;
            return this;
        }

        /**
         * @returns {ResourceMosaic}
         */
        resetComputedWidth() {
            this.computedWidth = 0;
            return this;
        }
    }

    return {ResourceMosaic: ResourceMosaic};
})();

export default ResourceMosaic;
export const then = ResourceMosaic.then.bind(ResourceMosaic);