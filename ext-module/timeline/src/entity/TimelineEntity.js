const TimelineEntity = (async () => {      

    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
        
    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    /**
     * @class TimelineEntity
     */
    class TimelineEntity  extends EntityIdentifier {

        /**
         * Constant
         */
        static get TO_RUN() { return 'to-run'; }

        constructor() {

            super();

            /**
             * @type {string|null}
             */
            this.name = null;

            /**
             * @type {Time}
             * @deprecated
             */
            this.time = new Time();

            /**
             * @type {Time}
             * @deprecated
             */
            this.timer = new Time();

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
         * @param {Time} time
         * @param {EntityReference} entityReference
         * @return TimelineEntity
         */
        addItem(time, entityReference = null) {

            let timelineItemSearch = this.getItem(time);
            let timelineItem = null;
            switch (true) {

                case timelineItemSearch === null && entityReference === null:
                    console.log('ADD TIMELINEITEM', 'vuoto', 'vuoto');
                    this.timelineItems.splice(
                        this._getIndexPrev(time), 0, new TimelineItem([], time));
                    break;

                case timelineItemSearch === null && entityReference !== null:
                    console.log('ADD TIMELINEITEM', 'vuoto', 'pieno');
                    timelineItem = new TimelineItem([entityReference], time);
                    this.timelineItems.splice(
                        this._getIndexPrev(time),
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
         *
         * TODO change name
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
         * @param {EntityReference} timeslotReference
         * @return {TimelineEntity}
         */
        removeItem(time, timeslotReference = null) {

            let index = this._getIndex(time);

            switch (true) {

                case index > -1 && timeslotReference !== null:
                    let item = this.getItem(time);
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

        /**
         * 
         */
        getDuration() {
           
            let last = this.timelineItems[this.timelineItems.length - 1];
            let duration = last.time.getDuration();  
            let itemDuration = 0;
            for(let index = 0; last.timeslotReferences.length > index; index++) {
                if(itemDuration < last.timeslotReferences[index].duration) {
                    itemDuration = last.timeslotReferences[index].duration;
                }
            }

            return (duration + itemDuration); 
        }
    }
    return {TimelineEntity: TimelineEntity};
})();

export default TimelineEntity;
export const then = TimelineEntity.then.bind(TimelineEntity);