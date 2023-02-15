const TimelineEntity = (async () => {      

    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
        
    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    /**
     * @class TimelineEntity
     */
    class TimelineEntity  extends EntityIdentifier {

        constructor() {

            super();

            /**FV
             * @type {string|null}
             */
            this.name = null;

            /**
             * @var number
             */
            this.currentTime = 0;

            /**
             * @type {Array}
             */
            this.timelineItems = [];

            // TODO add abstract class where put constant

            /**
             * @type {String}
             */
            this.status = TimeslotEntity.IDLE;

            /**
             * @type {String}
             */
            this.context = TimeslotEntity.CONTEXT_STANDARD;

            /**
             * @type {string}
             */
            this.rotation = TimeslotEntity.ROTATION_NO;

            /**
             * @type {Boolean}
             */
            this.enableAudio = false;

            /**
             * @type {Array}
             */
            this.binds = [];

        }


        /**
         * 
         */
         getDuration() {
           
            let itemDuration = 0;

            if (this.timelineItems.length === 0) {
                return itemDuration;
            }

            let last = this.timelineItems[this.timelineItems.length - 1];
            let lastItemDuration = last.time.getDuration();  
           
            for(let index = 0; last.timeslotReferences.length > index; index++) {
                if(itemDuration < last.timeslotReferences[index].duration) {
                    itemDuration = last.timeslotReferences[index].duration;
                }
            }

            return (lastItemDuration + itemDuration); 
        }

        getCurrentTime() {
            return this.currentTime;
        }

        setCurrentTime(currentTime) {
            this.currentTime = this.currentTime;
            return this;
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
            let item = this.timelineItems.find((element) => {
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
                    let item = this.timelineItems[index];
                    item.removeTimeslotReference(timeslotReference);
                    break;
                case index > -1 && timeslotReference === null:
                    this.timelineItems.splice(index, 1);
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
            return this.timelineItems.findIndex((element) => {
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
            for (let cont = this.timelineItems.length - 1; cont >= 0; cont--) {
                if (this.timelineItems[cont].time.getDuration() < seconds) {
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
            for (let cont = this.timelineItems.length - 1; cont >= 0; cont--) {
                if(second >= this.timelineItems[cont].time.getDuration()) {
                    item = this.timelineItems[cont];
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

            let timelineItemSearch = this.getItem(time.getDuration());
            let timelineItem = null;
            switch (true) {

                case timelineItemSearch === null && entityReference === null:
                    console.log('ADD TIMELINEITEM', 'vuoto', 'vuoto');
                    this.timelineItems.splice(
                        this._getIndexPrev(time.getDuration()), 0, new TimelineItem([], time));
                    break;

                case timelineItemSearch === null && entityReference !== null:
                    console.log('ADD TIMELINEITEM', 'vuoto', 'pieno');
                    timelineItem = new TimelineItem([entityReference], time);
                    this.timelineItems.splice(
                        this._getIndexPrev(time.getDuration()),
                        0,
                        new TimelineItem([entityReference], time)
                    );
                    break;

                case timelineItemSearch !== null && entityReference !== null:
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


        /**
         * @param {TimelineReference} timelineReference
         * @return {TimelineEntity}
         */
        appendBind(timelineReference) {
            // TODO move to validation
            if(timelineReference.id === this.id) {
                return;
            }

            this.binds.push(timelineReference);
            return this;
        }

        /**
         * @param {TimelineReference} timelineReference
         * @return {boolean}
         */
        removeBind(timelineReference) {
            if(timelineReference.id === this.id) {
                return;
            }

            let index = this.binds.findIndex(element => element.id === timelineReference.id);
            if (index > -1) {
                this.binds.splice(index, 1);
            }
            return index > -1;
        }
    }
    return {TimelineEntity: TimelineEntity};
})();

export default TimelineEntity;
export const then = TimelineEntity.then.bind(TimelineEntity);