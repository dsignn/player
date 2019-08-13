/**
 *
 */
class TimelineReference extends require('dsign-library').storage.model.AbstractReference {

    constructor() {

        super();

        /**
         * @type {string};
         */
        Object.defineProperty(
            this,
            "nameService",
            {writable: false, enumerable: true, configurable: true, value: TimelineConfig.NAME_SERVICE}
        );
    }

    /**
     * @param {Timeline} timeline
     * @return {TimelineReference}
     */
    static getReferenceFromEntity(timeline) {
        let entity = new TimelineReference();
        return entity.setReferenceId(timeline.id)
            .setName(timeline.name);

    }
}

module.exports = TimelineReference;