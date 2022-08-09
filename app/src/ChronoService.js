import { EventManagerAware } from "@dsign/library/src/event";
import { Time } from "@dsign/library/src/date/Time";

/**
 * @class ChronoService
 */
export class ChronoService extends EventManagerAware {

    /**
     * TYPE
     */
    static get TYPE_COUNTDOWN() { return 'countdown'; }

    static get TYPE_TIMER() { return 'timer'; }

    /**
     * STATUS 
     */
    static get STATUS_IDLE()  { return 'idle'; }

    static get STATUS_RUNNING()  { return 'running'; }

    static get STATUS_PAUSE()  { return 'pause'; }

    static get STATUS_TO_RUN() { return 'to-run'; }

    /**
     * EVENTS
     */

    static get PLAY()  { return 'play-timer'; }

    static get STOP()  { return 'stop-timer'; }
 
    static get PAUSE()  { return 'pause-timer'; }
 
    static get RESUME() { return 'resume-timer'; }

    static get DATA()  { return 'data'; }

    /**
     * @param {} timer 
     */
    constructor(timer) {

        super();

        /**
         * 
         */
        this.timer = timer;

        /**
         * 
         */
        this.runningTimer = {};

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
     * @private
     */
    _promoteToRunTimer() {
        /**
         *
         */
        for (let property in this.runningTimer) {
            if (this.runningTimer[property].status === ChronoService.STATUS_TO_RUN) {
                this.runningTimer[property].status = ChronoService.STATUS_RUNNING;
            }
        }
    }

        /**
     * @private
     */
    _scheduleRunningTimer() {
        for (let property in this.runningTimer) {

            if (this.runningTimer[property].status === ChronoService.STATUS_TO_RUN) {
                continue;
            }

            switch (true) {
                case this.runningTimer[property].type === ChronoService.TYPE_TIMER &&
                    this.runningTimer[property].timer.compare(this.runningTimer[property].endAt) > -1:
                    this.stop(this.runningTimer[property]);
                    break;
                case this.runningTimer[property].type === ChronoService.TYPE_COUNTDOWN &&
                this.runningTimer[property].endAt.compare(this.runningTimer[property].timer) > -1:
                    this.stop(this.runningTimer[property]);
                    break;
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
                case undefined:
                case null:
                case ChronoService.TYPE_TIMER:
                    this.runningTimer[property].sumSeconds(1);
                    break;
                case ChronoService.TYPE_COUNTDOWN:
                    this.runningTimer[property].subtractSecond(1);
                    break;
                default:
                    console.error('Wrong type timer ' . this.runningTimer[property].type);
            }

            this.eventManager.emit(ChronoService.DATA, this.runningTimer[property]);
        }
    }

    /**
     * @param {Time} time
     * @return {ChronoService}
     */
    setRunningTimer(time) {
       // this.runningTimer[time.getIdentifier()] = time;
       this.runningTimer[time.id] = time;
        return this;
    }

    /**
     * @param {Time} time
     * @return {ChronoService}
     * @private
     */
    _removeRunningTimer(time) {
        if (
            //this.runningTimer[time.getIdentifier()]
            this.runningTimer[time.id]
        ) {
            //delete this.runningTimer[time.getIdentifier()];
            delete this.runningTimer[time.id];
        }
        return this;
    }

    /**
     * @param {Time} time
     * @return {Promise}
     */
    async play(time) {
        this._playTimer(time);
    }
    
    /**
     * @param {Time} time
     */
    _playTimer(time) {
       
        this.setRunningTimer(time);
        time.status = ChronoService.STATUS_TO_RUN;
        this.eventManager.emit(ChronoService.PLAY, time);
    }

    /**
     * @param {Time} time
     * @return {Promise}
     */
    async pause(time) {
        this._pauseTimer(time);
    }
    
    /**
     * @param {Time} time
     * @private
     */
    _pauseTimer(time) {
       
        this._removeRunningTimer(time);
        time.status = ChronoService.STATUS_PAUSE;
        this.eventManager.emit(ChronoService.PLAY, time);
    }

    /**
     * @param {Time} time
     * @return {Promise}
     */
    async resume(time) {
        this._resumeTimer(time);
    }
    
    /**
     * @param {Time} time
     * @private
     */
    _resumeTimer(time) {
       
        this.setRunningTimer(time);
        time.status = ChronoService.STATUS_RUNNING;
        this.eventManager.emit(ChronoService.RESUME, time);
    }

    /**
     * @param {Time} time
     * @return {Promise}
     */
    async stop(time) {
        this._stopTimer(time);
    }
    
    /**
     * @param {Time} timer
     */
    _stopTimer(time) {
         
        this._removeRunningTimer(time);
        time.status = ChronoService.STATUS_IDLE;
        time.resetTimer();
        this.eventManager.emit(ChronoService.STOP, time);
    }
}