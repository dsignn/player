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
}

module.exports = TimelineItem;