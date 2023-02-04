const TimeslotTimelineRefence = (async () => {

    const { EntityReference } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityReference.js`));

    /**
     * @class TimeslotTimelineRefence
     */
    class TimeslotTimelineRefence extends EntityReference {

      /**
         * @param {Array} timeslots
         * @param {Time} time
         */
        constructor() { 
            super();

            this.duration =  0;
        }
    }

    return {TimeslotTimelineRefence: TimeslotTimelineRefence}
})();

export default TimeslotTimelineRefence;
export const then = TimeslotTimelineRefence.then.bind(TimeslotTimelineRefence);
