/**
 *
 */
class Panel {

    /**
     *
     */
    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {null|Object}
         */
        this.videoPanel = {};
    }

    /**
     * @returns {*}
     */
    getVideoPanel() {

        return this.videoPanel;
    }

    /**
     * @param {VideoPanel} videoPanal
     * @return Panel
     */
    setVideoPanel(videoPanal) {

        this.videoPanel = videoPanal;
        return this;
    }

    /**
     * @return {boolean}
     */
    hasVideoPanel() {

        return Object.keys(this.videoPanel).length === 0 && this.videoPanel.constructor === Object ? false : true;
    }

}

module.exports = Panel;