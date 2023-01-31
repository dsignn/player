const TimelineItem = (async () => {
    
    const { Time } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));

    /**
     * @class TimelineItem
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
         * @param {EntityReference} entityReference
         * @returns {number}
         * @private
         */
        _getTimeslotReferenceIndex(entityReference) {
            return this.timeslotReferences.findIndex((element) => {
                return element.id === entityReference.id;
            });
        }

        /**
         * @param {EntityReference} entityReference
         * @return {boolean}
         */
        hasTimeslotReference(entityReference) {
            let index = this.timeslotReferences.findIndex((element) => {
                return element.id === entityReference.id;
            });
            return index > -1;
        }

        /**
         * @param {EntityReference} entityReference
         * @return {TimelineItem}
         */
        addTimeslotReference(entityReference) {
            if (!this.hasTimeslotReference(entityReference)) {
                this.timeslotReferences.push(entityReference);
            }
            return this;
        }

        /**
         * @param {EntityReference} entityReference
         * @return {TimelineItem}
         */
        removeTimeslotReference(entityReference) {
            if (this.hasTimeslotReference(entityReference)) {
                this.timeslotReferences.splice(this._getTimeslotReferenceIndex(entityReference), 1);
            }
            return this;
        }
    }

    return {TimelineItem: TimelineItem}
})();

export default TimelineItem;
export const then = TimelineItem.then.bind(TimelineItem);
