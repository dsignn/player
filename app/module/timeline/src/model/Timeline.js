/**
 *
 */
class Timeline {

    constructor() {

        /**
         * @type {string|null}
         */
        this.name = null;

        /**
         * In second
         *
         * @type {number}
         */
        this.duration = 0;

        /**
         * @type {Array}
         */
        this.timlineItems = [];
    }

    /**
     * @param {Number} second
     * @param {TimelineItem} timelineItem
     * @return Timeline
     */
    addItem(second, timelineItem) {
        item.timelineSecond = second;
        if (this.temporalSuccession.length === 0) {
            this.temporalSuccession.push(

            )
        }


        return this;
    }

    /**
     * @param timelineItem
     * @return Timeline
     */
    removeItem(timelineItem) {

        return this;
    }
}

module.exports = Timeline;