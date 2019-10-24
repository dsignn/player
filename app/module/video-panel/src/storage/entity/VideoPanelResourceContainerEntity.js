/**
 * @class VideoPanelResourceEntity
 */
class VideoPanelResourceEntity extends require("@dsign/library").storage.entity.EntityIdentifier {

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
         * @type {(EntityReference|null)}
         */
        this.videoPanelContainerReference = null;

        /**
         * @type {(EntityReference|null)}
         */
        this.resourceReference = null;
    }
}

module.exports = VideoPanelResourceEntity;