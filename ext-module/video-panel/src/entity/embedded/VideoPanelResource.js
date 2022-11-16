const VideoPanelResource = (async () => {       

    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    /**
     * @class VideoPanelResource
     * TODO to inject into the entity container must be extend the EntityIdentifier
     */
    class VideoPanelResource extends EntityIdentifier {

        /**
         *
         */
        constructor() {
            super();

            /**
             * @type {(EntityNestedReference|Object)}
             */
            this.videoPanelReference = {};

            /**
             * @type {Array<EntityReference>}
             */
            this.resources = [];

            /**
             * @type {Array<VideoPanelResource>}
             */
            this.videoPanelResources = []
        }

        /**
         *
         * @param {Object} options
         * @return {Array<VideoPanelResource>}
         */
        getVideoPanelResources(options) {
            let videoPanelResources = this.videoPanelResources;
            if (options && !options.withoutRoot) {
                videoPanelResources = videoPanelResources.concat(this);
            }

            if (options && typeof options === 'object' && options.nested) {
                for (let cont = 0; this.videoPanelResources.length > cont; cont++) {
                    if (typeof this.videoPanelResources[cont].getVideoPanelResources === "function") {
                        options.withoutRoot = true;
                        let nestedVideoPanelResources = this.videoPanelResources[cont].getVideoPanelResources(options);
                        if (nestedVideoPanelResources.length > 0) {
                            videoPanelResources = videoPanelResources.concat(nestedVideoPanelResources);
                        }
                    }
                }
            }
            return videoPanelResources;
        }

        /**
         * @param {Number} index
         * @return {(VideoPanelResource|null)}
         */
        getVideoPanelResourceByIndex(index) {
            if (index < 0 && index > this.videoPanelResources.length) {
                return null;
            }

            return this.videoPanelResources[index];
        }

        /**
         * @param id
         * @returns {(VideoPanelResource|null)}
         */
        getVideoPanel(id) {

            if (this.id === id) {
                return this;
            }

            let videoPanelResources = this.getVideoPanelResources({nested:true});

            return videoPanelResources.find(
                (element) => {
                    return element.videoPanelReference.id === id;
                }
            );
        }

        /**
         * @param {VideoPanel} videoPanel
         * @return {boolean}
         */
        removeVideoPanel(id) {
            let remove = false;
            if (this.videoPanelReference.length > 0) {
                for (let cont = 0; this.videoPanelReference.length > cont; cont++) {

                    switch (true) {
                        case id === this.videoPanelReference[cont].id :
                            this.videoPanelReference.splice(cont, 1);
                            return true;
                            break;

                        case typeof this.videoPanelReference[cont].removeVideoPanel === "function":
                            remove = remove || this.videoPanelReference[cont].removeVideoPanel(id);
                            break
                    }
                }
            }
            return remove;
        }
    }

    return {VideoPanelResource: VideoPanelResource};
})();

export default VideoPanelResource;
export const then = VideoPanelResource.then.bind(VideoPanelResource);