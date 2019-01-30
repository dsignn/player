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
         * @type {Time}
         */
        this.time = new Time();

        /**
         * @type {Array}
         */
        this.timelineItems = [];
    }

    /**
     * @param {Time} time
     * @param {Timeslot} timeslot
     * @return Timeline
     */
    addItem(time, timeslot) {
        
        if (this.hasTime(time)) {

        } else {
            this.timelineItems.splice(this._getIndexPrev(time), 0, new TimelineItem(
                [TimeslotReference.getTimeslotReferenceFromTimeslot(timeslot)],
                time)
            );
        }

        return this;
    }

    /**
     * @param {Time} time
     * @return {boolean}
     * @private
     */
    hasTime(time) {
        return this._getIndex(time) > -1;
    }

    /**
     * @param {Time}  time
     * @return {Time|null}
     * @private
     */
    _getItem(time) {
        return this.timelineItems.find((element) => {
            return time.compare(element.time) === 0;
        });
    }

    /**
     * -1 not found higher is the index of the timelineitem
     *
     * @param time
     * @return {Number}
     * @private
     */
    _getIndex(time) {
        return this.timelineItems.findIndex((element) => {
            return time.compare(element.time) === 0;
        });
    }

    /**
     * @param time
     * @return {number}
     * @private
     */
    _getIndexPrev(time) {
        let index = this.timelineItems.length;
        for (let cont = 0; this.timelineItems.length > cont; cont++) {
            if (time.compare(this.timelineItems[cont].time) > 0) {
                index = cont;
                break;
            }
        }
        return index;
    }

    /**
     * @param {Time} time
     * @param {Timeslot} timeslot
     * @return {Timeline}
     */
    removeItem(time, timeslot) {

        let index = this._getIndex(time);

        if (index < 0) {
            return;
        }

        console.log('remove',index)
        if (!timeslot) {
            this.timelineItems.splice(index, 1);
        }

        return this;
    }
}

module.exports = Timeline;