
try {
    EvtManager = require('./../../../../lib/event/EvtManager');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

class Timer {

    static get TYPE_COUNTDOWN() { return 'countdown'; }

    static get TYPE_TIMER() { return 'timer'; }

    static get STATUS_IDLE()  { return 'idle'; }

    static get STATUS_RUNNING()  { return 'running'; }

    static get STATUS_PAUSE()  { return 'pause'; }

    constructor() {

        /**
         * @type {Object}
         */
        this.startAt = {};

        /**
         * @type {Object}
         */
        this.endAt = {};

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
         * Event manager
         */
        this.eventManager = new EvtManager();

        /**
         * @type {easytimer}
         */
        this.timer = new (require('easytimer.js'))();
        this.timer.addEventListener('secondTenthsUpdated', this.proxy.bind(this));
        this.timer.addEventListener('secondsUpdated', this.proxy.bind(this));
        this.timer.addEventListener('minutesUpdated', this.proxy.bind(this));
        this.timer.addEventListener('hoursUpdated', this.proxy.bind(this));
        this.timer.addEventListener('daysUpdated', this.proxy.bind(this));
        this.timer.addEventListener('stopped', this.proxy.bind(this));
        this.timer.addEventListener('reset', this.proxy.bind(this));
        this.timer.addEventListener('started', this.proxy.bind(this));
        this.timer.addEventListener('paused', this.proxy.bind(this));
    }

    _startConfig() {
        let params = {};

        params.countdown = this.type === Timer.TYPE_TIMER ? false : true;
        params.startValues = this.startAt;
        params.target = this.endAt;
        return params;
    }

    start() {
        this.timer.start(this._startConfig());
    }

    stop() {
        this.timer.stop();
    }

    pause() {
        this.timer.pause();
    }

    /**
     * @return {string}
     */
    getStatus() {
        let status = Timer.STATUS_IDLE;
        switch (true) {
            case this.timer.isRunning() === true:
                status = Timer.STATUS_RUNNING;
                break;

            case this.timer.isPaused() === true:
                status = Timer.STATUS_PAUSE;
                break;
        }
        return status;
    }

    /**
     *
     * @param evt
     */
    proxy(evt) {
        this.eventManager.fire(evt.type, this);
    }
}

module.exports = Timer;