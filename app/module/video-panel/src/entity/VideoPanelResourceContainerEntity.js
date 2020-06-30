import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class VideoPanelResourceContainerEntity
 */
export class VideoPanelResourceContainerEntity extends EntityIdentifier {

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