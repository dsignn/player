import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier"

/**
 * @class VideoPanelContainerEntity
 */
export class VideoPanelContainerEntity extends EntityIdentifier {

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