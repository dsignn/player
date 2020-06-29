/**
 *
 */
class TimelineItem {

    /**
     * @param {Array} timeslots
     * @param {Time} time
     */
    constructor(timeslots = [], time = new (require("@dsign/library").date.Time)()) {

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

module.exports = TimelineItem;