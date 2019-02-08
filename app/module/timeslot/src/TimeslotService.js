/**
 *
 */
class TimeslotService {

    static get PLAY()  { return 'play-timeslot'; }

    static get STOP()  { return 'stop-timeslot'; }

    static get PAUSE()  { return 'pause-timeslot'; }

    static get RESUME() { return 'resume-timeslot'; }

    /**
     * @param {Storage} timeslotStorage
     * @param {sender} sender
     * @param {Timer} timer
     * @param {TimeslotDataInjectorServicePluginManager} dataInjectorManager
     */
    constructor(timeslotStorage, sender, timer, dataInjectorManager) {

        /**
         *
         */
        this.sender = sender ? sender : null;

        /**
         * @type {Timer}
         */
        this.timer = timer;

        /**
         * @type {Storage}
         */
        this.storage = timeslotStorage ? timeslotStorage : null;

        /**
         * @type {TimeslotDataInjectorServicePluginManager}
         */
        this.dataInjectorManager = dataInjectorManager ? dataInjectorManager : new TimeslotDataInjectorServicePluginManager();

        /**
         * Event manager
         */
        this.eventManager = new (require('dsign-library').event.EvtManager)();

        /**
         * List running timeslots
         * @type {Object}
         */
        this.runningTimeslots = {};

        /**
         * Listeners
         */
        this.eventManager.on(TimeslotService.PLAY, this.changeRunningTimeslot.bind(this));
        this.eventManager.on(TimeslotService.PAUSE, this.changePauseTimeslot.bind(this));
        this.eventManager.on(TimeslotService.STOP, this.changeIdleTimeslot.bind(this));
        this.eventManager.on(TimeslotService.RESUME, this.changeResumeTimeslot.bind(this));

        if (!this.timer) {
            throw 'Timer not set';

        }

        this.timer.addEventListener('secondTenthsUpdated', (evt)  => {
        // this.timer.addEventListener('secondsUpdated', (evt)  => {
            this.schedule();
        });
    }

    schedule() {

        /*
        let data = {
            timelineSecondsTenths : this.timer.getTotalTimeValues().secondTenths
        };

        this.eventManager.fire(`timeline-${data.timelineSecondsTenths}`, data, true);
        */
        let data = {
            timelineSecondsTenths : this.timer.getTotalTimeValues().secondTenths
        };

        this.eventManager.fire(`timeline-${data.timelineSecondsTenths}`, data, true);
        this._updateRunnintTimslots();
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
     * @param timeslot
     */
    setRunningTimeslot(timeslot) {
       this.runningTimeslots[`${timeslot.virtualMonitorReference.monitorId}-${timeslot.context}`] = timeslot;
    }

    /**
     *
     * @param timeslot
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
     * @param timeslot
     */
    play(timeslot) {


        this._synchExtractTimeslotData(timeslot).then(
            (timeslotData) => {
                console.log('TIMESLOT DATA', timeslotData);

                let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
                if (runningTimeslot) {
                    this.pause(runningTimeslot);
                }

                timeslot.options.typeService = 'timeslot';
                this._executeBids(timeslot, 'play');
                this.sender.send(
                    TimeslotService.PLAY,
                    {
                        timeslot : timeslot,
                        data: timeslotData
                    }
                );
                this.eventManager.fire(TimeslotService.PLAY, timeslot);
                console.log('RES', `timeline-${this.timer.getTotalTimeValues().secondTenths + (parseInt(timeslot.duration) - timeslot.currentTime)  * 10}`);
                if (timeslot.rotation === Timeslot.ROTATION_INFINITY) {
                    return;
                }

                this.eventManager.on(
                    `timeline-${this.timer.getTotalTimeValues().secondTenths + (parseInt(timeslot.duration) * 10)}`,
                    this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
                )
            }
        );
    }

    /**
     * @param timeslot
     */
    stop(timeslot) {

        timeslot.options.typeService = 'timeslot';

        this._executeBids(timeslot, 'stop');
        this.sender.send(
            TimeslotService.STOP,
            {timeslot : timeslot}
        );
        this.eventManager.fire(TimeslotService.STOP, timeslot);
    }

    /**
     * @param timeslot
     */
    pause(timeslot) {

        timeslot.options.typeService = 'timeslot';
        this._executeBids(timeslot, 'pause');
        this.sender.send(
            TimeslotService.PAUSE,
            {timeslot : timeslot}
        );
        this.eventManager.fire(TimeslotService.PAUSE, timeslot);
    }

    /**
     * @param timeslot
     */
    resume(timeslot) {

        this._synchExtractTimeslotData(timeslot).then(
            (timeslotData) => {


                let runningTimeslot = this.getRunningTimeslot(timeslot.virtualMonitorReference.monitorId, timeslot.context);
                if (runningTimeslot) {
                    this.pause(runningTimeslot);
                }

                timeslot.options.typeService = 'timeslot';
                this._executeBids(timeslot, 'resume');
                this.sender.send(
                    TimeslotService.RESUME,
                    {timeslot : timeslot, data: timeslotData}
                );
                this.eventManager.fire(TimeslotService.RESUME, timeslot);
                console.log('RES', `timeline-${this.timer.getTotalTimeValues().secondTenths + (parseInt(timeslot.duration) - timeslot.currentTime)  * 10}`);
                this.eventManager.on(
                    `timeline-${this.timer.getTotalTimeValues().secondTenths + (parseInt(timeslot.duration) - timeslot.currentTime)  * 10}`,
                    this.processTimeslot.bind({timeslotService : this, timeslot: timeslot})
                );
            }
        );
    }


    /**
     *
     * @param evt
     */
    processTimeslot(evt) {
        if (!this.timeslotService.isRunning(this.timeslot)) {
            console.log('TIMESLOT NOT RUNNING', this.timeslot);
            return;
        }

        let runningTimeslot =  this.timeslotService
            .getRunningTimeslot(this.timeslot.virtualMonitorReference.monitorId, this.timeslot.context);

        console.log('PROCESS TIMESLOT',runningTimeslot, runningTimeslot.currentTime, runningTimeslot.duration);
        this.timeslotService.eventManager._consoleDebug();

        switch (true) {
            case runningTimeslot && runningTimeslot.currentTime < (parseInt(runningTimeslot.duration)-1):
                console.log('NON ANCORA',runningTimeslot, runningTimeslot.currentTime, (parseInt(runningTimeslot.duration)-1));
                break;
            case this.timeslot.rotation === Timeslot.ROTATION_LOOP:
                this.timeslotService.play(this.timeslot);
                break;
            case this.timeslot.rotation === Timeslot.ROTATION_INFINITY:
                break;
            case runningTimeslot !== undefined:
                this.timeslotService.stop(this.timeslot);
                break
        }

    }

    /**
     * @param evt
     */
    changeRunningTimeslot(evt) {
        console.log('START TIMESLOT',  evt.data);

        this.setRunningTimeslot(evt.data);
        evt.data.status = Timeslot.RUNNING;
        evt.data.currentTime = 0;
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     * @param evt
     */
    changeResumeTimeslot(evt) {
        console.log('RESUME TIMESLOT',  evt.data.id);

        evt.data.status = Timeslot.RUNNING;
        this.setRunningTimeslot(evt.data);
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    changePauseTimeslot(evt) {
        console.log('PAUSE TIMESLOT',  evt.data.id);

        this.removeRunningTimeslot(evt.data);
        evt.data.status = Timeslot.PAUSE;

        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     * @param evt
     */
    changeIdleTimeslot(evt) {
        console.log('STOP TIMESLOT',  evt.data.id);
        this.removeRunningTimeslot(evt.data);

        evt.data.status = Timeslot.IDLE;
        evt.data.currentTime = 0;
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     * @private
     */
    _updateRunnintTimslots() {

        for (let key in this.runningTimeslots) {
            if (this.runningTimeslots[key].currentTime >= this.runningTimeslots[key].duration ||  this.runningTimeslots[key].rotation === Timeslot.ROTATION_INFINITY) {
                continue;
            }

            this.runningTimeslots[key].currentTime = parseFloat(Number(this.runningTimeslots[key].currentTime + 0.1).toFixed(2));
          //  this.runningTimeslots[key].currentTime++;
            this.storage.update(this.runningTimeslots[key])
                .then((data) => {})
                .catch((err) => { console.log(err) });
        }
    }

    /**
     * @param timeslot
     * @param method
     * @private
     */
    _executeBids(timeslot, method) {

        if (timeslot.binds.length === 0) {
            return;
        }

        for (let cont = 0; timeslot.binds.length > cont; cont++) {
            this[method](timeslot.binds[cont]);
        }
    }

    /**
     * @param {Array} dataReferences
     * @return {Promise}
     * @private
     */
    _extractTimeslotDataFromDataReferences(dataReferences) {
        let promises = [];

        for (let cont = 0; dataReferences.length > cont;  cont++) {
            if (this.dataInjectorManager.has(dataReferences[0].name)) {
                promises.push(this.dataInjectorManager
                    .get(dataReferences[0].name).getTimeslotData(dataReferences[cont].data
                    ));
            }
        }

        return Promise.all(promises);
    }

    /**
     *
     * @param timeslot
     * @return {Object|null}
     * @private
     */
    async _synchExtractTimeslotData(timeslot) {
        let data = null;
        if (timeslot.dataReferences.length === 0) {
            return data;
        }

        data = await this._extractTimeslotDataFromDataReferences(timeslot.dataReferences);

        return data;
    }
}

module.exports = TimeslotService;