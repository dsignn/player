/**
 *
 */
class VideoPanelResource extends VideoPanel {

    /**
     *
     */
    constructor() {

        super();

        /**
         * @type {boolean}
         */
        this.singleResource = false;

        /**
         * @type {Array}
         */
        this.resources = [];
    }

    /*
     * @param {ResourceReference} resourceReference
     * @return {VideoPanelResource}
     */
    appendResource(resourceReference) {
        this.resources.push(resourceReference);
        return this;
    }

}

module.exports = VideoPanelResource;