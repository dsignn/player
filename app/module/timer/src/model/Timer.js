/**
 *
 */
class Timer {

    static get TYPE_COUNTDOWN() { return 'countdown'; }

    static get TYPE_TIMER() { return 'timer'; }

    static get STATUS_IDLE()  { return 'idle'; }

    static get STATUS_RUNNING()  { return 'running'; }

    static get STATUS_PAUSE()  { return 'pause'; }

    static get STATUS_TO_RUN() { return 'to-run'; }

    constructor() {

        /**
         * @type {Object}
         */
        this.startAt = new Time();

        /**
         * @type {Object}
         */
        this.endAt = new Time();

        /**
         * @type {Time}
         */
        this.timer = new Time();

        /**
         * @type string|Object
         */
        this.name = null;

        /**
         * @type {number}
         */
        this.autoStart = 0;

        /**
         * @type string|Object
         */
        this.type = Timer.TYPE_TIMER;

        /**
         * @type {string}
         */
        this.status = Timer.STATUS_IDLE
    }

    /**
     * @return {Timer}
     */
    resetTimer() {
        this.timer = this.startAt.clone();
        return this;
    }
}

module.exports = Timer;