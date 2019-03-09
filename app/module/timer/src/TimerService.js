/**
 *
 */
class TimerService {
    /**
     * Constant
     */
    static get DATA()  { return 'data-timer'; }

    static get PLAY()  { return 'play-timer'; }

    static get STOP()  { return 'stop-timer'; }

    static get PAUSE()  { return 'pause-timer'; }

    static get RESUME() { return 'resume-timer'; }

    /**
     * @param {Storage} timerStorage
     * @param {AbstractSender} sender
     * @param {Timer} timer
     */
    constructor(timerStorage, sender, timer) {

        /**
         * @type {Storage}
         */
        this.timerStorage = timerStorage ? timerStorage : null;

        /**
         * @type {ipcRenderer}
         */
        this.sender = sender;

        /**
         * @type {Timer}
         */
        this.timer = timer;

        /*
         * @type {Object}
         */
        this.runningTimer = {};

        /**
         * Event manager
         */
        this.eventManager = new (require('dsign-library').event.EvtManager)();

        /**
         * Add schedule listener
         */
        this.timer.addEventListener('secondsUpdated', (evt)  => {
            this._schedule();
        });
    }

    /**
     * @param evt
     */
    _schedule(evt) {

        this._promoteToRunTimer();
        this._scheduleRunningTimer();
        this._updateRunningTimer();
    }


    /**
     * @param {Timer} timer
     * @return {Boolean}
     */
    hasRunningTimer(timer) {
        return !!this.runningTimer[timer.id];
    }

    /**
     * @param {Timer} timer
     * @return {Timer}
     */
    getRunningTimer(timer) {
        return this.runningTimer[timer.id];
    }

    /**
     * @param {Timer} timer
     * @return {TimerService}
     */
    setRunningTimer(timer) {
        this.runningTimer[timer.id] = timer;
        return this;
    }

    /**
     * @param {Timer} timer
     * @return {TimerService}
     * @private
     */
    _removeRunningTimer(timer) {
        if (this.runningTimer[timer.id]) {
            delete this.runningTimer[timer.id];
        }
        return this;
    }

    /**
     * @private
     */
    _promoteToRunTimer() {
        /**
         *
         */
        for (let property in this.runningTimer) {
            if (this.runningTimer[property].status === Timer.STATUS_TO_RUN) {
                this.runningTimer[property].status = Timer.STATUS_RUNNING;
            }
        }
    }

    /**
     * @private
     */
    _updateRunningTimer() {
        for (let property in this.runningTimer) {

            // TODO
            switch (this.runningTimer[property].type) {
                case Timer.TYPE_TIMER:
                    this.runningTimer[property].timer.sumSeconds(1);
                    break;
                case Timer.TYPE_COUNTDOWN:
                    this.runningTimer[property].timer.subtractSecond(1);
                    break;
                default:
                    console.error('Wrong type timer ' . this.runningTimer[property].type);
            }

            this._send(TimerService.DATA, this.runningTimer[property]);

            this.timerStorage.update( this.runningTimer[property])
                .then((data) => {})
                .catch((err) => { console.log(err) });
        }
    }

    /**
     * @private
     */
    _scheduleRunningTimer() {
        for (let property in this.runningTimer) {

            if (this.runningTimer[property].status === Timer.STATUS_TO_RUN) {
                continue;
            }

            switch (true) {
                case this.runningTimer[property].type === Timer.TYPE_TIMER &&
                    this.runningTimer[property].timer.compare(this.runningTimer[property].endAt) > -1:
                    this.stop(this.runningTimer[property]);
                    break;
                case this.runningTimer[property].type === Timer.TYPE_COUNTDOWN &&
                this.runningTimer[property].endAt.compare(this.runningTimer[property].timer) > -1:
                    this.stop(this.runningTimer[property]);
                    break;
            }
        }
    }

    /**
     * @param {Timer} timer
     * @return {Promise}
     */
    async play(timer) {
        this._playTimer(timer);
    }

    /**
     * @param {Timer} timer
     */
    _playTimer(timer) {
        timer.status = Timer.STATUS_TO_RUN;
        this.setRunningTimer(timer);
        this._send(TimerService.PLAY, this.getRunningTimer(timer));
    }

    /**
     * @param {Timer} timer
     * @return {Promise}
     */
    async pause(timer) {
        this._pauseTimer(timer);
    }

    /**
     * @param {Timer} timer
     * @private
     */
    _pauseTimer(timer) {
        this._send(TimerService.PAUSE, this.getRunningTimer(timer));
        this._removeRunningTimer(timer);
        timer.status = Timer.STATUS_PAUSE;
        this.timerStorage.update(timer)
            .then((data) => {
                // console.log('STOP timeline')
            }).catch((err) => { console.error(err)});
    }

    /**
     * @param {Timer} timer
     * @return {Promise}
     */
    async resume(timer) {
        this._resumeTimer(timer);
    }

    /**
     * @param {Timer} timer
     * @private
     */
    _resumeTimer(timer) {
        timer.status = Timer.STATUS_RUNNING;
        this.setRunningTimer(timer);
        this._send(TimerService.RESUME, this.getRunningTimer(timer));
    }

    /**
     * @param {Timer} timer
     * @return {Promise}
     */
    async stop(timer) {
        this._stopTimer(timer);
    }

    /**
     * @param {Timer} timer
     */
    _stopTimer(timer) {
        this._send(TimerService.STOP, this.getRunningTimer(timer));
        this._removeRunningTimer(timer);
        timer.status = Timer.STATUS_IDLE;
        timer.resetTimer();
        this.timerStorage.update(timer)
            .then((data) => {
                // console.log('STOP timeline')
            }).catch((err) => { console.error(err)});
    }

    /**
     *
     * @param {string} type
     * @param {Timer} timer
     * @private
     */
    _send(type, timer) {

        // TODO create a class proxy
        let message = {
            data : timer,
            nameMessage :type
        };

        this.sender.send('proxy', message);
    }
}

module.exports = TimerService;