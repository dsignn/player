try {
    EvtManager = require('./../../../lib/event/EvtManager');
}
catch(err) {

    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
}

class TimerService {

    static get PLAY()  { return 'play-timer'; }

    static get STOP()  { return 'stop-timer'; }

    static get PAUSE()  { return 'pause-timer'; }

    static get RESUME() { return 'resume-timer'; }

    /**
     * @param {ipcRenderer} sender
     * @param hydrator
     */
    constructor(sender, hydrator) {

        /**
         * @type {ipcRenderer}
         */
        this.sender = sender;

        /**
         * @type {AbstractHydrator}
         */
        this.hydrator = hydrator;

        /*
         * @type {Object}
         */
        this.activeTimer = {};

        /**
         * Event manager
         */
        this.eventManager = new EvtManager();
    }

    /**
     * @param id
     * @return {Boolean}
     */
    hasActiveTimer(id) {
        return !!this.activeTimer[id];
    }

    /**
     * @param id
     * @return {Timer}
     */
    getActiveTimer(id) {
        return this.activeTimer[id];
    }

    /**
     * @param {Timer} timer
     */
    start(timer) {
        if (this.activeTimer[timer.id] || timer.getStatus() !== Timer.STATUS_IDLE) {
            return;
        }

        this.activeTimer[timer.id] = timer;
        this.activeTimer[timer.id].eventManager.on('secondTenthsUpdated', this._progress.bind(this));

        this.activeTimer[timer.id].eventManager.on('stopped', this._stopped.bind(this));
        this.activeTimer[timer.id].eventManager.on('start', this._start.bind(this));
        this.activeTimer[timer.id].eventManager.on('pause', this._pause.bind(this));
        this.activeTimer[timer.id].start();
    };

    /**
     * @param {Timer} timer
     */
    stop(timer) {
        if (!this.activeTimer[timer.id]) {
            return;
        }

      //  this.activeTimer[timer.id].removeEventListener('secondTenthsUpdated', this._progress.bind(this));
        this.activeTimer[timer.id].stop();
        this.sender.send(
            'proxy',
            {nameMessage : 'timer-stop', data : evt.data}
        );
        delete this.activeTimer[timer.id];
    }

    /**
     * @param {Timer} timer
     */
    pause(timer) {
        if (!this.activeTimer[timer.id]) {
            return;
        }

        this.activeTimer[timer.id].pause();
    }

    /**
     * @param {Timer} timer
     */
    resume(timer) {
        if (!this.activeTimer[timer.id]) {
            return;
        }

        this.activeTimer[timer.id].start();
    }

    /**
     * @param evt
     */
    _progress(evt) {
        this.eventManager.fire('progress', evt.data);

        evt.data.progress = evt.data.timer.getTimeValues();
        this.sender.send(
            'proxy',
            {nameMessage : 'timer-progress', data : evt.data}
        );
    }

    _stopped(evt) {
        this.eventManager.fire('stop', evt.data);
        delete this.activeTimer[evt.data.id];
    }

    _start(evt) {
        this.eventManager.fire('start', evt.data);
    }

    _pause(evt) {
        this.eventManager.fire('pause', evt.data);
    }
}

module.exports = TimerService;