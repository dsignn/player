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
    constructor(id = null, name = null, duration = 0, currentTime = 0, virtualMonitorReference = {}) {
        super(id, name);

        /**
         * @type {Number}
         */
        this.duration = duration;

        /**
         * @type {Number}
         */
        this.currentTime = currentTime;

        /**
         *
         * @type {Object}
         */
        this.virtualMonitorReference = virtualMonitorReference;
    }

    /**
     * @return {number}
     */
    getDuration() {
        return parseInt(this.duration);
    }

    /**
     * @return {number}
     */
    getCurrentTime() {
        return parseFloat(this.currentTime);
    }

    /**
     * @return {string}
     */
    getCurrentTimeString() {
        let currentTime = this.currentTime+'';
        switch (true) {
            case parseFloat(this.currentTime) % 1 === 0:
                currentTime = parseFloat(this.currentTime) + '.0';
                break;
        }
        return currentTime;
    }

    /**
     * @param {Timeslot} timeslot
     * @return {TimeslotReference}
     */
    static getInstanceFromTimeslot(timeslot) {
        return new TimeslotPlaylistReference(
            timeslot.id,
            timeslot.name,
            timeslot.duration,
            timeslot.currentTime,
            timeslot.virtualMonitorReference = timeslot.virtualMonitorReference
        );

    }
}

module.exports = TimeslotPlaylistReference;