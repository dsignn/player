import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class PlaylistEntity
 */
export class PlaylistEntity extends EntityIdentifier {

    /**
     * Constant
     */
    static get RUNNING() { return 'running'; }
    static get IDLE() { return 'idle'; }
    static get PAUSE() { return 'pause'; }

    static get ROTATION_NO() { return 'rotation-no'; }
    static get ROTATION_LOOP() { return 'rotation-loop'; }

    static get CONTEXT_STANDARD() { return 'standard'; }
    static get CONTEXT_DEFAULT() { return 'default'; }
    static get CONTEXT_OVERLAY() { return 'overlay'; }

    /**
     * @return {string}
     * @constructor
     */
    constructor() {
        super();

        /**
         * @type {String}
         */
        this.name = null;

        /**
         * @type {String}
         */
        this.status = PlaylistEntity.IDLE;

        /**
         * @type {String}
         */
        this.context = PlaylistEntity.CONTEXT_STANDARD;

        /**
         * @type {boolean}
         */
        this.rotation = PlaylistEntity.ROTATION_NO;

        /**
         * @type {Boolean}
         */
        this.enableAudio = false;

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
     * @return boolean
     */
    hasMonitorContainer() {
        return this.timeslots.length > 0;
    }

    /**
     * @return boolean
     */
    getMonitorContainer() {
        return this.timeslots.length > 0 ? this.timeslots.monitorContainerReference : null;
    }

    /**
     * @param {TimeslotEntity} timeslot
     * @return {PlaylistEntity}
     */
    appendTimeslot(timeslot) {
        if (!this._isValidTimeslot(timeslot)) {
            console.warn(`Wrong timeslot to append to the playlist`);
            return;
        }
        this.timeslots.push(timeslot);
        return this;
    }

    /**
     *
     * @param {TimeslotEntity} timeslot
     * @return {boolean}
     */
    removeTimeslot(timeslot) {
        //  TODO remove all timeslot with this id
        let index = this.timeslots.findIndex(element => element.id === timeslot.id);
        if (index > -1) {
            this.timeslots.splice(index, 1);
        }

        return index > -1;
    }

    /**
     * @param {number} index
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
     * @param {PlaylistEntity} playlist
     * @return {PlaylistEntity}
     */
    appendBind(playlist) {
        if(playlist.id === this.id) {
            return;
        }

        this.binds.push(playlist);
        return this;
    }

    /**
     *
     * @param {PlaylistEntity} playlist
     * @return {boolean}
     */
    removeBind(playlist) {
        if(playlist.id === this.id) {
            return;
        }

        let index = this.binds.findIndex(element => element.id === playlist.id);
        if (index > -1) {
            this.binds.splice(index, 1);
        }
        return index > -1;
    }

    /**
     * @return {null|TimeslotPlaylistReference}
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
     * @return {null|EntityReference}
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
     * @return {null|TimeslotPlaylistReference}
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
     * @return {null|TimeslotPlaylistReference}
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
     * @return {Number}
     */
    count() {
        return this.timeslots.length;
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
     * @param {Number} second
     * @return {PlaylistEntity}
     */
    setSecond(second) {
        if(second < 1 || second > this.getDuration()) {
            return;
        }

        let index = 0;

        for (let cont = 0; this.timeslots.length > cont; cont++) {
            let durationTimeslot = this.timeslots[cont].duration;
            if (second > durationTimeslot) {
                second = second - durationTimeslot;
                index++;
            } else {

                this.current().reset();
                this.timeslots[cont].currentTime = second;
                this.currentIndex = index;
                break;
            }
        }
        return this;
    }

    /**
     * @return {string|null}
     */
    getMonitorId() {
        let monitorId = null;
        if (this.timeslots.length > 0) {
            monitorId = this.timeslots[0].monitorContainerReference.id;
        }
        return monitorId
    }

    /**
     * TODO SPOSTARE FUORI
     * @param {TimeslotEntity} timeslot
     * @return {boolean}
     * @private
     */
    _isValidTimeslot(timeslot) {
        let check = true;
        switch (true) {
            case timeslot === null:
            case typeof timeslot !== 'object':
            case !timeslot.monitorContainerReference || !timeslot.monitorContainerReference.id:
            case this.timeslots.length > 0 && !!this.timeslots[0].monitorContainerReference && this.timeslots[0].monitorContainerReference.id !== timeslot.monitorContainerReference.id:
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

    /**
     * @return {string|number}
     */
    getCurrentTimeString() {
        let currentTime = 0;
        for (let cont = this.currentIndex -1; cont > -1; cont--) {
            currentTime += this.timeslots[cont].getDuration();
        }

        currentTime += this.current() ? this.current().getCurrentTime() : 0;

        currentTime += '';
        switch (true) {
            case currentTime % 1 === 0:
                currentTime = currentTime + '.0';
                break;
        }
        return currentTime;
    }
}