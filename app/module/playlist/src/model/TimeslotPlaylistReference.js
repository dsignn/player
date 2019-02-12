/**
 *
 */
class TimeslotPlaylistReference extends TimeslotReference {

    /**
     *
     * @param {string} id
     * @param {string} name
     * @param {Number} duration
     * @param {Number} currentTime
     */
    constructor(id = null, name = null, duration = 0, currentTime = 0) {
        super(id, name);

        /**
         * @type {null|integer}
         */
        this.duration = duration;

        /**
         * @type {integer}
         */
        this.currentTime = currentTime;
    }
    /**
     * @param timeslot
     * @return {TimeslotReference}
     */
    static getInstanceFromTimeslot(timeslot) {
        return new TimeslotPlaylistReference(
            timeslot.id,
            timeslot.name,
            timeslot.duration,
            timeslot.currentTime
        );

    }
}

module.exports = TimeslotPlaylistReference;