/**
 *
 */
class TimelineItem {

    /**
     * @param {Array} timeslots
     * @param {Time} time
     */
    constructor(timeslots = [], time = new Time()) {

        /**
         * @type {Array}
         */
        this.timeslotReferences = timeslots;


        /**
         * @type {Time}
         */
        this.time = time;
    }

    /**
     * @return {boolean}
     */
    hasTimeslotReference() {
        return !!this.timeslotReferences.length;
    }

    /**
     * @param {EntityReference} timeslotRefence
     * @return {TimelineItem}
     */
    addTimeslotReference(timeslotRefence) {
        this.timeslotReferences.push(timeslotRefence);
        return this;
    }

    /**
     * @param {EntityReference} timeslotReference
     * @return {TimelineItem}
     */
    removeTimeslotReference(timeslotReference) {
        let index = this.timeslotReferences.findIndex((element) => {
            return element.id === timeslotReference.id;
        });

        if (index > -1) {
            this.timeslotReferences.splice(index, 1);
        }

        return this;
    }
}

module.exports = TimelineItem;