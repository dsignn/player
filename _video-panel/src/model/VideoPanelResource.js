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

    /**
     * @return {null|ResourceReference}
     */
    removeResourceByIndex(index) {
        let returnValue = null;
        if (this.resources.length > index) {
            returnValue = this.resources.splice(index, 1)[0];
        }
        return returnValue;
    }

}

module.exports = VideoPanelResource;