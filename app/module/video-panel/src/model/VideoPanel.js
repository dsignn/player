/**
 *
 */
class VideoPanel {

    /**
     *
     */
    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {null|Number}
         */
        this.height = null;

        /**
         * @type {null|Number}
         */
        this.width = null;

        /**
         * @type {null|string}
         */
        this.virtualMonitorReference = null;

        /**
         * @type {Array}
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
     * @param options
     * @return {Array}
     */
    getVideoPanels(options) {
        let videoPanels = this.videoPanels;
        if (options && !options.withoutRoot) {
            videoPanels = videoPanels.concat(this);
        }

        if (options && typeof options === 'object' && options.nested) {
            for (let cont = 0; this.videoPanels.length > cont; cont++) {
                if (typeof this.videoPanels[cont].getVideoPanels === "function") {
                    let nestedvideoPanel = this.videoPanels[cont].getVideoPanels(options);
                    if (nestedvideoPanel.length > 0) {
                        videoPanels = videoPanels.concat(nestedvideoPanel);
                    }
                }
            }
        }
        return videoPanels;
    }

    /**
     * @param id
     * @returns {*}
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