
class Playlist {

    /**
     * Constant
     */
    static get RUNNING() { return 'running'; }
    static get IDLE() { return 'idle'; }
    static get PAUSE() { return 'pause'; }

    static get CONTEXT_STANDARD() { return 'standard'; }
    static get CONTEXT_DEFAULT() { return 'default'; }
    static get CONTEXT_OVERLAY() { return 'overlay'; }

    /**
     * @return {string}
     * @constructor
     */
    constructor() {

        /**
         * @type {String}
         */
        this.name = null;

        /**
         * @type {String}
         */
        this.status = Playlist.IDLE;

        /**
         * @type {String}
         */
        this.context = Playlist.CONTEXT_STANDARD;

        /**
         * @type {boolean}
         */
        this.loop = false;

        /**
         * @type {number}
         */
        this.currentIndex = 0;

        /**
         * @type {Array}
         */
        this.timeslots = [];

        /**
         * @type {Array}
         */
        this.binds = [];
    }

    /**
     * @return {Number}
     */
    getDuration() {

        let duration = 0;
        for (let cont = 0; this.timeslots.length > cont; cont++) {
            duration = duration + parseInt(this.timeslots[cont].duration);
        }
        return duration;
    }

    /**
     * @return {Number}
     */
    count() {
        return this.timeslots.length;
    }

    /**
     * @param timeslot
     * @return {Playlist}
     */
    appendTimeslot(timeslot) {
        //  TODO check if timeslot is correct
        this.timeslots.push(timeslot);
        return this;
    }

    /**
     *
     * @param timeslot
     * @return {boolean}
     */
    removeTimeslot(timeslot) {
        //  TODO check if timeslot is correct
        let index = this.timeslots.findIndex(element => element.id === timeslot.id);
        if (index > -1) {
            this.timeslots.splice(index, 1);
        }
        return index > -1;
    }

    /**
     * @param index
     * @return {number}
     */
    removeTimeslotIndex(index) {
        let search = -1;
        if (this.timeslots.length > index) {
            search = index;
            this.timeslots.splice(index, 1);
        }
        return search;
    }

    /**
     * @param timeslot
     * @return {Playlist}
     */
    appendBind(playlist) {
        //  TODO check if timeslot is correct
        this.binds.push(playlist);
        return this;
    }

    /**
     *
     * @param timeslot
     * @return {boolean}
     */
    removeBind(playlist) {
        //  TODO check if timeslot is correct
        let index = this.binds.findIndex(element => element.id === playlist.id);
        if (index > -1) {
            this.binds.splice(index, 1);
        }
        return index > -1;
    }



    /**
     *
     * @return {null|Timeslot}
     */
    current() {
        let timeslot = null;
        if (this.currentIndex < this.timeslots.length) {
            timeslot = this.timeslots[this.currentIndex];
            timeslot.context = this.context;
        }
        return timeslot;
    }

    /**
     * @return {null|Timeslot}
     */
    first() {
        let timeslot = null;
        if (this.timeslots.length > 0) {
            timeslot = this.timeslots[0];
            timeslot.context = this.context;
        }
        return timeslot;
    }

    /**
     * @return {Boolean}
     */
    hasNext() {
        return (this.currentIndex + 1) < this.timeslots.length;
    }

    /**
     * @return {null|Timeslot}
     */
    next() {
        let timeslot = null;
        if ((this.currentIndex + 1) < this.timeslots.length) {
            this.currentIndex++;
            this.timeslots[this.currentIndex-1].currentTime = 0;
            timeslot = this.timeslots[this.currentIndex];
            timeslot.context = this.context;
        }
        return timeslot;
    }

    /**
     * @return {null|Timeslot}
     */
    previous() {
        let timeslot = null;
        if (this.currentIndex > 0 && (this.currentIndex - 1) < this.timeslots.length) {
            this.currentIndex--;
            timeslot = this.timeslots[this.currentIndex];
            timeslot.context = this.context;
        }
        return timeslot;
    }

    /**
     *
     */
    reset() {
        this.currentIndex = 0;
        for (let cont = 0; this.timeslots.length > cont; cont++) {
            this.timeslots[cont].currentTime = 0;
        }
    }

    /**
     * @return {String|null}
     */
    getMonitorId() {
        let monitorId = null;
        if (this.timeslots.length > 0) {
            monitorId = this.timeslots[0].virtualMonitorReference.monitorId;
        }
        return monitorId
    }

    /**
     *
     * @param timeslot
     * @return {boolean}
     * @private
     */
    _isValidTimeslot(timeslot) {
        let check = true;
        switch (true) {
            case timeslot === null:
            case typeof timeslot !== 'object':
            case !timeslot.monitor || !timeslot.monitor.id:
            case this.timeslots.length < 1 || !this.timeslots[0].monitor || this.timeslots[0].monitor.id !== timeslot.monitor.id:
                check = false;
                break
        }
        return check;
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getOption(name) {
        let option = null;
        if (this.options && typeof this.options === 'object' && this.options[name]) {
            option = this.options[name];
        }
        return option;
    }
}

module.exports = Playlist;