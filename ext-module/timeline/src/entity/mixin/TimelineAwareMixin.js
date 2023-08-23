const TimelineAwareMixin = (async () => {      
    /**
     * 
     * @class TimelineAwareMixin 
     */
    const TimelineAwareMixin = (superClass) => {


        return class extends superClass {

            constructor() {
                super();

                this.items = [];
            }

            /**
             * @param {number} second
             * @return {boolean}
             * @private
             */
            hasItem(seconds) {
                return this._getIndex(seconds) > -1;
            }

            /**
             * @returns bool
             */
            hasCurrentTimeItem() {
                return this.hasItem(this.currentTime);
            }

            /**
             * @param {Number} seconds 
             * @returns 
             */
            getItem(seconds) {
                let item = this.items.find((element) => {
                    return element.time.getDuration() === seconds;
                });
                return item ? item : null
            }

            /**
             * @returns bool
             */
            getCurrentTimeItem() {
                return this.getItem(this.currentTime);
            }

            /**
             * @param {TimelineItem} item
             * @param {EntityReference} timeslotReference
             * @return {TimelineEntity}
             */
            removeItem(item, timeslotReference = null) {

                let index = this._getIndex(item.getDuration());

                switch (true) {

                    case index > -1 && timeslotReference !== null:
                        let item = this.items[index];
                        item.removeTimeslotReference(timeslotReference);
                        break;
                    case index > -1 && timeslotReference === null:
                        this.items.splice(index, 1);
                        break;
                    default:
                        console.log('DELETE TIMELINEITEM', 'salta');
                        break;
                }
                return this;
            }


            /**
             * -1 not found higher is the index of the timelineitem
             *
             * @param time
             * @return {Number}
             * @private
             */
            _getIndex(seconds) {
                return this.items.findIndex((element) => {
                    return element.time.getDuration() === seconds;
                });
            }

            /**
             * @param time
             * @return {number}
             * @private
             */
            _getIndexPrev(seconds) {
                let index = 0;
                for (let cont = this.items.length - 1; cont >= 0; cont--) {
                    if (this.items[cont].time.getDuration() < seconds) {
                        index = cont + 1;
                        break;
                    }
                }
                return index;
            }

            /**
             * @param second
             */
            getPreviousItem(second) {
                let item = null;
                for (let cont = this.items.length - 1; cont >= 0; cont--) {
                    if (second >= this.items[cont].time.getDuration()) {
                        item = this.items[cont];
                        break;
                    }
                }

                return item;
            }

            /**
             * 
             */
            getCurrentTimePreviuosItem() {
                return this.getPreviousItem(this.currentTime);
            }

            /**
             * @param {Time} time
             * @param {EntityReference} entityReference
             * @return TimelineEntity
             */
            addItem(time, entityReference = null) {

                let itemSearch = this.getItem(time.getDuration());
                let timelineItem = null;
                switch (true) {

                    case itemSearch === null && entityReference === null:
                        console.log('ADD TIMELINEITEM', 'vuoto', 'vuoto');
                        this.items.splice(
                            this._getIndexPrev(time.getDuration()), 0, new TimelineItem([], time));
                        break;

                    case itemSearch === null && entityReference !== null:
                        console.log('ADD TIMELINEITEM', 'vuoto', 'pieno');
                        timelineItem = new TimelineItem([entityReference], time);
                        this.items.splice(
                            this._getIndexPrev(time.getDuration()),
                            0,
                            new TimelineItem([entityReference], time)
                        );
                        break;

                    case itemSearch !== null && entityReference !== null:
                        console.log('ADD TIMELINEITEM', 'pieno', 'pieno');
                        timelineItemSearch.addTimeslotReference(entityReference);
                        break;
                    default:
                        console.log('ADD TIMELINEITEM', 'salta');
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

                if (this.currentTime < seconds) {
                    throw 'Time of timeline are to low'
                }

                while (this.currentTime > seconds) {

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
    }

    return {TimelineAwareMixin: TimelineAwareMixin};
})();


export default TimelineAwareMixin;
export const then = TimelineAwareMixin.then.bind(TimelineAwareMixin);