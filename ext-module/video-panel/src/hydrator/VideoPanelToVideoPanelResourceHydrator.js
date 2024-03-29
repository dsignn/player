const VideoPanelToVideoPanelResourceHydrator = (async () => {   

    const { AbstractHydrator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/hydrator/AbstractHydrator.js`));

    /**
     * @class VideoPanelToVideoPanelResourceHydrator
     */
    class VideoPanelToVideoPanelResourceHydrator extends AbstractHydrator {

        constructor() {
            super();

            /**
             * @type {(EntityNestedReference|Object)}
             */
            this.videoPanelResourceTemplate = null;
        }

        /**
         * @param {object} data
         */
        extract(data) {
                throw 'TODO'
        }
        /**
         * @param {object} data
         * @param {object} object
         */
        hydrate(data, object) {

            object = object ? object : this.getTemplateObjectHydration();
            object.videoPanelReference = this.videoPanelResourceTemplate ? new this.videoPanelResourceTemplate.constructor() : {};
            object.videoPanelReference.collection = 'video-panel';

            if (data.id) {
                object.videoPanelReference.id = data.id;
            }

            if (data.name) {
                object.videoPanelReference.name = data.name;
            }

            if (data.parentId) {
                object.videoPanelReference.parentId = data.parentId;
            }

            if (data.parentName) {
                object.videoPanelReference.parentName = data.parentName;
            }

            if (data.videoPanels && Array.isArray(data.videoPanels) && data.videoPanels.length > 0)  {
                for (let cont = 0; data.videoPanels.length > cont; cont++) {
                    object.videoPanelResources.push(this.hydrate(data.videoPanels[cont]));
                }
            }

            return object;
        }
    }
    return {VideoPanelToVideoPanelResourceHydrator: VideoPanelToVideoPanelResourceHydrator};
})();

export default VideoPanelToVideoPanelResourceHydrator;
export const then = VideoPanelToVideoPanelResourceHydrator.then.bind(VideoPanelToVideoPanelResourceHydrator);