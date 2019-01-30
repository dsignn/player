/**
 *
 */
class TimeslotReference {

    /**
     * @param {string} id
     * @param {string} name
     */
    constructor(id = null, name = null) {

        /**
         * @type {null|string}
         */
        this.referenceId = id;

        /**
         * @type {null|string}
         */
        this.name = name;
    }

    /**
     * @param timeslot
     * @return {TimeslotReference}
     */
    static getTimeslotReferenceFromTimeslot(timeslot) {
        return new TimeslotReference(
            timeslot.id,
            timeslot.name
        );

    }
}

module.exports = TimeslotReference;