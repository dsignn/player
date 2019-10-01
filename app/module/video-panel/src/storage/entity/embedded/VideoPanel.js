/**
 * @class VideoPanel
 * TODO to inject into the entity container must be extend the EntityIdentifier
 */
class VideoPanel extends require("@dsign/library").storage.entity.EntityIdentifier {

    /**
     *
     */
    constructor() {
        super();

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {(null|Number)}
         */
        this.height = null;

        /**
         * @type {null|Number}
         */
        this.width = null;

        /**
         * @type {(null|string)}
         */
        this.monitorContainerReference = null;

        /**
         * @type {Array<VideoPanel>}
         */
        this.videoPanels = [];
    }

    /**
     * @param {VideoPanel} videoPanel
     * @return {Panel}
     */
    appendVideoPanel(videoPanel) {
        this.videoPanels.push(videoPanel);
        return this;
    }

    /**
     *
     * @param {Object} options
     * @return {Array<VideoPanel>}
     */
    getVideoPanels(options) {
        let videoPanels = this.videoPanels;
        if (options && !options.withoutRoot) {
            videoPanels = videoPanels.concat(this);
        }

        if (options && typeof options === 'object' && options.nested) {
            for (let cont = 0; this.videoPanels.length > cont; cont++) {
                if (typeof this.videoPanels[cont].getVideoPanels === "function") {
                    options.withoutRoot = true;
                    let nestedVideoPanel = this.videoPanels[cont].getVideoPanels(options);
                    if (nestedVideoPanel.length > 0) {
                        videoPanels = videoPanels.concat(nestedVideoPanel);
                    }
                }
            }
        }
        return videoPanels;
    }

    /**
     * @param {Number} index
     * @return {VideoPanel}
     */
    getVideoPanelByIndex(index) {
        if (index < 0 && index > this.videoPanels.length) {
            return null;
        }

        return this.videoPanels[index];
    }

    /**
     * @param {VideoPanel} videoPanel
     * @return {boolean}
     */
    removeVideoPanel(videoPanel) {
        let remove = false;
        if (this.videoPanels.length > 0) {
            for (let cont = 0; this.videoPanels.length > cont; cont++) {

                switch (true) {
                    case videoPanel.id === this.videoPanels[cont].id :
                        this.videoPanels.splice(cont, 1);
                        return true;
                        break;

                    case typeof this.videoPanels[cont].removeVideoPanel === "function":
                        remove = remove || this.videoPanels[cont].removeVideoPanel(videoPanel);
                        break
                }

            }
        }
        return remove;
    }

    /**
     * @param id
     * @returns {(VideoPanel|null)}
     */
    getVideoPanel(id) {

        if (this.id === id) {
            return this;
        }

        let videoPanels = this.getVideoPanels({nested:true});

        return videoPanels.find(
            (element) => {
                return element.id === id;
            }
        );
    }
}

module.exports = VideoPanel;