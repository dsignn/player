/**
 *
 */
class Timeline {

    /**
     * Constant
     */
    static get TO_RUN() { return 'to-run'; }

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
         * @type {Time}
         */
        this.timer = new Time();

        /**
         * @type {Array}
         */
        this.timelineItems = [];

        /**
         * @type {String}
         */
        this.status = Timeslot.IDLE;

        /**
         * @type {String}
         */
        this.context = Timeslot.CONTEXT_STANDARD;

        /**
         * @type {string}
         */
        this.rotation = Timeslot.ROTATION_NO;

    }

    /**
     * @param {Time} time
     * @param {Timeslot} timeslot
     * @return Timeline
     */
    addItem(time, timeslot = null) {

        let item = this.getItem(time);
        let timelineItem = null;
        switch (true) {

            case item === null && timeslot === null:
                console.log('ADD TIMELINEITEM', 'vuoto', 'vuoto');
                this.timelineItems.splice(this._getIndexPrev(time), 0, new TimelineItem([], time));
                break;

            case item === null && timeslot !== null:
                console.log('ADD TIMELINEITEM', 'vuoto', 'pieno');
                timelineItem = new TimelineItem(
                    [TimeslotReference.getTimeslotReferenceFromTimeslot(timeslot)],
                    time
                );
                this.timelineItems.splice(this._getIndexPrev(time), 0, timelineItem);
                break;

            case item !== null && timeslot !== null:
                console.log('ADD TIMELINEITEM', 'pieno', 'pieno');
                timelineItem = this.getItem(time);
                timelineItem.addTimeslotReference(TimeslotReference.getTimeslotReferenceFromTimeslot(timeslot));
                break;
            default:
                console.log('ADD TIMELINEITEM', 'salta');
                break;
        }

        return this;
    }

    /**
     * @param {Time} time
     * @return {boolean}
     * @private
     */

    hasItem(time) {
        return this._getIndex(time) > -1;
    }

    /**
     * @param {Time}  time
     * @return {TimelineItem|null}
     * @private
     */
    getItem(time) {
        let item = this.timelineItems.find((element) => {
            return time.compare(element.time) === 0;
        });

        return item ? item : null
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
     */
    getPreviousItem(time) {
        let item = null;
        for (let cont = this.timelineItems.length - 1; cont >= 0; cont--) {
            if(time.compare(this.timelineItems[cont].time) > -1) {
                item = this.timelineItems[cont];
                break;
            }
        }

        return item;
    }

    /**
     * @param time
     * @return {number}
     * @private
     */
    _getIndexPrev(time) {
        let index = this.timelineItems.length;
        for (let cont = 0; this.timelineItems.length > cont; cont++) {
            if (time.compare(this.timelineItems[cont].time) < 0) {
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
    removeItem(time, timeslot = null) {

        let index = this._getIndex(time);

        switch (true) {

            case index > -1 && timeslot !== null:
                console.log('REMOVE TIMELINEITEM', 'pieno', 'pieno');
                let item = this.getItem(time);
                item.removeTimeslotReference(TimeslotReference.getTimeslotReferenceFromTimeslot(timeslot));
                break;
            case index > -1 && timeslot === null:
                console.log('REMOVE TIMELINEITEM', 'pieno', 'vuoto');
                this.timelineItems.splice(index, 1);
                break;
            default:
                console.log('DELETE TIMELINEITEM', 'salta');
                break;
        }


        return this;
    }

    /**
     * @param seconds
     */
    fillItems(seconds) {

        if (!seconds || seconds < 1 || seconds > 60) {
            throw 'Wrong input'
        }

        let time = new Time(0, 0, seconds);

        if (this.time.compare(time) < 0) {
            throw 'Time of timeline are to low'
        }

        while (this.time.compare(time) > 1) {

            this.addItem(time.clone());

            // Control seconds
            switch (true) {
                case time.seconds + seconds > 59:
                    time.minutes += 1;
                    time.seconds = (time.seconds + seconds) % 60;
                    break;
                default:
                    time.seconds += seconds;
                    break;
            }

            switch (true) {
                case time.minutes > 59:
                    time.minutes = 0;
                    time.hours += 1;
                    break;
            }
        }

    }
}

module.exports = Timeline;