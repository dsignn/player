/**
 *
 */
class TimerEntity extends require("@dsign/library").storage.entity.EntityIdentifier {

    static get TYPE_COUNTDOWN() { return 'countdown'; }

    static get TYPE_TIMER() { return 'timer'; }

    static get STATUS_IDLE()  { return 'idle'; }

    static get STATUS_RUNNING()  { return 'running'; }

    static get STATUS_PAUSE()  { return 'pause'; }

    static get STATUS_TO_RUN() { return 'to-run'; }

    constructor() {
        super();

        /**
         * @type {Time}
         */
        this.startAt = new (require("@dsign/library").date.Time)();

        /**
         * @type {Time}
         */
        this.endAt = new (require("@dsign/library").date.Time)();

        /**
         * @type {Time}
         */
        this.timer = new (require("@dsign/library").date.Time)();

        /**
         * @type string|Object
         */
        this.name = null;

        /**
         * @type {number}
         */
        this.autoStart = 0;

        /**
         * @type string
         */
        this.type = TimerEntity.TYPE_TIMER;

        /**
         * @type {string}
         */
        this.status = TimerEntity.STATUS_IDLE
    }

    /**
     * @return {TimerEntity}
     */
    resetTimer() {
        this.timer = this.startAt.clone();
        return this;
    }
}

module.exports = TimerEntity;