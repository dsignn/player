/**
 *
 */
class TimeslotService extends AbstractTimeslotService {

    /**
     * @param {Storage} timeslotStorage
     * @param {AbstractSender} sender
     * @param {Timer} timer
     * @param {TimeslotDataInjectorServicePluginManager} dataInjectorManager
     */
    constructor(timeslotStorage, sender, timer, dataInjectorManager) {

        super(timeslotStorage, sender, timer, dataInjectorManager);

        /**
         * List running timeslots
         * @type {Object}
         */
        this.runningTimeslots = {};

        this.timer.addEventListener('secondTenthsUpdated', (evt)  => {
            this._schedule();
        });
    }

    /**
     * @private
     */
    _schedule() {

        this._scheduleRunningPlaylist();
        this._updateRunningTimslot();
    }

    /**
     *
     * @param {Timeslot} timeslot
     * @return {boolean}
     */
    isRunning(timeslot) {

        let isRunning = false;
        switch (true) {
            case this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_STANDARD}`] !== undefined &&
                this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_STANDARD}`].id === timeslot.id:
                isRunning = true;
                break;
            case this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`] !== undefined &&
                this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`].id === timeslot.id:
                isRunning = true;
                break;
            case this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_DEFAULT}`] !== undefined &&
                this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_DEFAULT}`].id === timeslot.id:
                isRunning = true;
                break;
        }
        return isRunning;
    }

    /**
     * @param monitorId
     * @param context
     * @return {Object}
     */
    getRunningTimeslot(monitorId, context) {
        return this.runningTimeslots[`${monitorId}-${context}`];
    }

    /**
     * @param {Timeslot} timeslot
     */
    setRunningTimeslot(timeslot) {
       this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${timeslot.context}`] = timeslot;
    }

    /**
     *
     * @param {Timeslot} timeslot
     */
    removeRunningTimeslot(timeslot) {

        let nameContext = `${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_OVERLAY}`;
        if (this.runningTimeslots[nameContext] && this.runningTimeslots[nameContext].id === timeslot.id) {
            delete this.runningTimeslots[nameContext];
        }

        nameContext = `${timeslot.virtualMonitorReference.monitorId}-${Timeslot.CONTEXT_STANDARD}`;
        if (this.runningTimeslots[nameContext] && this.runningTimeslots[nameContext].id === timeslot.id) {
            delete this.runningTimeslots[nameContext];
        }
    }

    /**
     * @private
     */
    _scheduleRunningPlaylist() {
        for (let property in this.runningTimeslots) {

            switch (true) {
                case this.runningTimeslots[property].rotation === Timeslot.ROTATION_LOOP && this.runningTimeslots[property].getDuration() <= this.runningTimeslots[property].getCurrentTime():
                    this.runningTimeslots[property].reset()
                    this.play(this.runningTimeslots[property]);
                    break;
                case this.runningTimeslots[property].getDuration() <= this.runningTimeslots[property].getCurrentTime():
                    this.stop(this.runningTimeslots[property]);
                    break;
            }
        }
    }

    /**
     * @param {Timeslot} timeslot
     * @param {Object} options
     * @return {Promise}
     */
    async play(timeslot, options = {}) {


        let dataTimeslot = await this._synchExtractTimeslotData(timeslot);

        let bindTimeslots = options.isBindExecution !== false ? await this.getTimeslotsFromArrayReference(timeslot.binds) : [];
        this._playTimeslot(timeslot, dataTimeslot);
        this._executeBids(bindTimeslots, 'play');
        this.eventManager.fire(TimeslotService.PLAY, timeslot);
    }

    /**
     * @param {Timeslot} timeslot
     * @param {Object} options
     * @return {Promise}
     */
    async stop(timeslot, options = {}) {

        let bindTimeslots = options.isBindExecution !== false ? await this.getTimeslotsFromArrayReference(timeslot.binds) : [];
        this._stopTimeslot(timeslot);
        this._executeBids(bindTimeslots, 'stop');
        this.eventManager.fire(TimeslotService.STOP, timeslot);
    }

    /**
     * @param {Timeslot} timeslot
     * @param {Object} options
     * @return {Promise}
     */
    async pause(timeslot, options = {}) {

        let bindTimeslots = options.isBindExecution !== false ? await this.getTimeslotsFromArrayReference(timeslot.binds) : [];
        this._pauseTimeslot(timeslot);
        this._executeBids(bindTimeslots, 'pause');
        this.eventManager.fire(TimeslotService.PAUSE, timeslot);
    }

    /**
     * @param {Timeslot} timeslot
     * @return {Promise}
     */
    async resume(timeslot, options = {}) {

        let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
        let bindTimeslots = options.isBindExecution !== false ? await this.getTimeslotsFromArrayReference(timeslot.binds) : [];
        this._resumeTimeslot(timeslot, dataTimeslot);
        this._executeBids(bindTimeslots, 'resume');
        this.eventManager.fire(TimeslotService.RESUME, timeslot);
    }

    /**
     * @param {Timeslot} timeslot
     * @param {Object} dataTimeslot
     * @private
     */
    _playTimeslot(timeslot, dataTimeslot) {

        let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
        if (runningTimeslot) {
            this.pause(runningTimeslot);
        }

        this.setRunningTimeslot(timeslot);
        timeslot.status  = Timeslot.RUNNING;
        timeslot.currentTime = 0;

        this._send(TimeslotService.PLAY, timeslot, dataTimeslot);
        this.timeslotStorage.update(timeslot)
            .then((data) => { console.log('PLAY playlist EVT')})
            .catch((err) => { console.error(err)});

    }

    /**
     * @param timeslot
     * @param dataTimeslot
     * @private
     */
    _resumeTimeslot(timeslot, dataTimeslot) {
        let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
        if (runningTimeslot) {
            this.pause(runningTimeslot);
        }

        this.setRunningTimeslot(timeslot);
        timeslot.status = Timeslot.RUNNING;

        this._send(TimeslotService.RESUME, timeslot, dataTimeslot);
        this.timeslotStorage.update(timeslot)
            .then((data) => { console.log('PLAY timeslot EVT')})
            .catch((err) => { console.error(err)});
    }

    /**
     * @param timeslot
     * @private
     */
    _pauseTimeslot(timeslot) {

        this.removeRunningTimeslot(timeslot);

        timeslot.status = Timeslot.PAUSE;
        this._send(TimeslotService.PAUSE, timeslot);

        this.timeslotStorage.update(timeslot)
            .then((data) => { console.log('PLAY timeslot EVT')})
            .catch((err) => { console.error(err)});
    }

    _stopTimeslot(timeslot) {

        this.removeRunningTimeslot(timeslot);
        timeslot.status = Timeslot.IDLE;
        timeslot.reset();

        this._send(TimeslotService.STOP, timeslot);

        this.timeslotStorage.update(timeslot)
            .then((data) => { console.log('STOP timeslot EVT')})
            .catch((err) => { console.error(err)});
    }

    /**
     * @private
     */
    _updateRunningTimslot() {

        for (let property in this.runningTimeslots) {

            if (this.runningTimeslots[property].rotation !== Timeslot.ROTATION_INFINITY) {
                this.runningTimeslots[property].currentTime = parseFloat(this.runningTimeslots[property].getCurrentTime() + 0.1).toFixed(1);
            }

            this.timeslotStorage.update(this.runningTimeslots[property])
                .then((data) => {})
                .catch((err) => { console.log(err) });
        }
    }

    /**
     * @param timeslots
     * @param method
     * @private
     */
    _executeBids(timeslots, method) {

        for (let cont = 0; timeslots.length > cont; cont++) {
            this[method](timeslots[cont], {isBindExecution : false})
                .catch((err) => {console.error('Error bind timeslot service', err)});
        }
    }

    /**
     *
     * @param {string} type
     * @param {Timeslot} timeslot
     * @param {Object} data
     * @private
     */
    _send(type, timeslot, data = null) {

        let message = {
            timeslot : timeslot
        };

        if(data) {
            message.data = data;
        }

        this.sender.send(type, message);
    }
}

module.exports = TimeslotService;