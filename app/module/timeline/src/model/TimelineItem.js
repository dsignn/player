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
     * @param timeslotRefence
     * @return {TimelineItem}
     */
    addTimeslotReference(timeslotRefence) {
        this.timeslotReferences.push(timeslotRefence);
        return this;
    }

    /**
     * @param timeslotRefence
     * @return {TimelineItem}
     */
    removeTimeslotReference(timeslotReference) {
        let index = this.timeslotReferences.findIndex((element) => {
            return element.referenceId === element.referenceId;
        });

        if (index > -1) {
            this.timeslotReferences.splice(index, 1);
        }

        return this;
    }
}

module.exports = TimelineItem;