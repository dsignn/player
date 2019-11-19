/**
 *
 */
class TimelineService extends AbstractTimeslotService {

    /**
     * @param {Storage} timeslotStorage
     * @param {AbstractSender} sender
     * @param {Timer} timer
     * @param {TimeslotDataInjectorServicePluginManager} dataInjectorManager
     * @param {Storage} timelineStorage
     */
    constructor(timeslotStorage, sender, timer, dataInjectorManager, timelineStorage) {

        /**
         *
         */
        super(timeslotStorage, sender, timer, dataInjectorManager);
        /**
         * @type {Storage}
         */
        this.timelineStorage = timelineStorage;

        /**
         * List to run timelines
         *
         * @type {Object}
         */
        this.runningTimelines = {};

        this.timer.addEventListener('secondsUpdated', (evt) => {
            this._schedule();
        });
    }

    /**
     * @param evt
     */
    _schedule(evt) {

        this._promoteToRunTimeline();
        this._startTimelinePromote();
        this._updateRunningTimeline();
        this._scheduleRunningTimeline();
    }

    /**
     * @param timeline
     * @return TimelineService
     * @private
     */
    _removeRunningTimeline(timeline) {
        if (this.runningTimelines[timeline.id]) {
            delete this.runningTimelines[timeline.id];
        }
        return this;
    }

    /**
     * @param {Timeline} timeline
     * @return TimelineService
     * @private
     */
    _addRunningTimeline(timeline) {
        if (!this.runningTimelines[timeline.id]) {
            this.runningTimelines[timeline.id] = timeline;
        }
        return this;
    }

    /**
     * @param {Timeline} timeline
     * @return boolean
     * @private
     */
    isRunning(timeline) {
        return !!this.runningTimelines[timeline.id];
    }

    /**
     * @param {Timeline} timeline
     * @return {Timeline|null}
     */
    getRunningTimeline(timeline) {
        let runningTimeline = null;
        if (this.isRunning(timeline)) {
            runningTimeline = this.runningTimelines[timeline.id];
        }
        return runningTimeline;
    }

    /**
     * @private
     */
    _updateRunningTimeline() {

        for (let property in this.runningTimelines) {
            if (this.runningTimelines[property].status === TimeslotEntity.RUNNING) {
                this.runningTimelines[property].timer.sumSeconds(1);
                this.timelineStorage.update(this.runningTimelines[property])
                    .then((data) => {
                        //console.log('update timeline')
                    })
                    .catch((err) => { console.error(err)});
            }
        }
    }

    /**
     * @private
     */
    _promoteToRunTimeline() {
        /**
         *
         */
        for (let property in this.runningTimelines) {
            if (this.runningTimelines[property].status === TimelineEntity.TO_RUN) {
                this.runningTimelines[property].status = TimeslotEntity.RUNNING;
            }
        }
    }

    /**
     * @private
     */
    _scheduleRunningTimeline() {
        for (let property in this.runningTimelines) {

            // TODO reimpost loop
            switch (true) {
                // Loop controll
                case this.runningTimelines[property].status === TimeslotEntity.RUNNING &&
                        this.runningTimelines[property].timer.compare(this.runningTimelines[property].time) > -1 &&
                        this.runningTimelines[property].rotation === TimeslotEntity.ROTATION_LOOP:
                    this.runningTimelines[property].timer.reset();
                    this._checkTimeslotToStart(this.runningTimelines[property]);
                    break;
                // Stop controll
                case this.runningTimelines[property].status === TimeslotEntity.RUNNING &&
                        this.runningTimelines[property].timer.compare(this.runningTimelines[property].time) > -1 :
                    // TODO event
                    this._stopTimeline( this.runningTimelines[property]);
                    break;
                case this.runningTimelines[property].status === TimeslotEntity.RUNNING:
                    this._checkTimeslotToStart(this.runningTimelines[property]);
                    break;
            }
        }
    }

    /**
     * @private
     */
    _startTimelinePromote() {
        for (let property in this.runningTimelines) {
            if (this.runningTimelines[property].status === TimeslotEntity.RUNNING &&
                this.runningTimelines[property].timer.compare(new (require("@dsign/library").date.Time)()) === 0) {

                this._checkTimeslotToStart(this.runningTimelines[property]);
            }
        }
    }

    /**
     * @param {Timeline} timeline
     */
    _checkTimeslotToStart(timeline) {

        if (timeline.hasItem(timeline.timer)) {
            let item = timeline.getItem(timeline.timer);
            if (item.timeslotReferences.length > 0) {
                this._runTimelineItem(TimelineService.PLAY, timeline, item);
            }
        }
    }

    /**
     * @param {string} type (play or resume)
     * @param {Timeline} timeline
     * @param {TimelineItem} item
     * @param {number} delay
     * @return {Promise}
     */
    _runTimelineItem(type, timeline, item, delay = 0) {
        let promises = [];

        for (let cont = 0; item.timeslotReferences.length > cont; cont++) {
            promises.push(this.timeslotStorage.get(item.timeslotReferences[cont].id));
        }

        Promise.all(promises).then(async (timeslots) => {

            for (let cont = 0; timeslots.length > cont; cont++) {
                // TODO inject data
                timeslots[cont].currentTime = delay;
                this._injectDataFromTimeline(timeslots[cont], timeline);
                let dataTimeslot = await this._synchExtractTimeslotData(timeslots[cont]);
                this._send(type, timeline, timeslots[cont], dataTimeslot);
            }
        })
    }

    /**
     * @param {TimelineEntity} timeline
     * @param {TimelineEntity} timeslot
     * @private
     */
    _playTimeslot(timeline, timeslot) {
        this._send(TimelineService.PLAY, timeline, timeslot);
    }

    /**
     * @param {TimelineEntity} timeline
     * @private
     */
    _stopTimeline(timeline) {
        // TODO add event timeline
        timeline.status = TimeslotEntity.IDLE;
        timeline.timer.reset();
        this._send(TimelineService.STOP, timeline);
        this.timelineStorage.update(timeline)
            .then((data) => {
                // console.log('STOP timeline')
            }).catch((err) => { console.error(err)});
        this._removeRunningTimeline(timeline);
    }

    /**
     * @param {TimelineEntity} timeline
     * @private
     */
    _pauseTimeline(timeline) {

        timeline.status = TimeslotEntity.PAUSE;
        this._send(TimelineService.PAUSE, timeline);
        this.timelineStorage.update(timeline)
            .then((data) => {
                //console.log('PAUSE timeline')
            }).catch((err) => { console.error(err)});
        this._removeRunningTimeline(timeline);
    }

    /**
     * @param {TimelineEntity} timeline
     * @private
     */
    _restoreTimeline(timeline, event) {

        timeline.status = TimeslotEntity.RUNNING;
        let item = timeline.getPreviousItem(timeline.timer);
        // TODO control time timeslot in timeline
        this._runTimelineItem(event, timeline, item, item.time.getDiffSecond(timeline.timer));
        this._addRunningTimeline(timeline);

        this.timelineStorage.update(timeline)
            .then((data) => {
                //console.log('RESUME timeline')
            }).catch((err) => { console.error(err)});
    }

    /**
     * @param {TimelineEntity} timeline
     * @return {TimelineService}
     */
    async play(timeline) {
        if (this.isRunning(timeline)) {
            return;
        }

        let bindTimelines = timeline.isBind !== true ? await this.getTimelineFromArrayReference(timeline.binds) : [];
        timeline.status = TimelineEntity.TO_RUN;
        if (this.isRunning(timeline) === false) {
            this._addRunningTimeline(timeline);
        }
        this._executeBids(bindTimelines, 'play');
        return this;
    }

    /**
     * @param {TimelineEntity} timeline
     * @return {TimelineService}
     */
    async stop(timeline) {

        let bindTimelines = timeline.isBind !== true ? await this.getTimelineFromArrayReference(timeline.binds) : [];
        this._stopTimeline(timeline);
        this._executeBids(bindTimelines, 'stop');
        return this;
    }

    /**
     * @param {TimelineEntity} timeline
     * @return {TimelineService}
     */
    async pause(timeline) {
        if (!this.isRunning(timeline)) {
            return;
        }
        let bindTimelines = timeline.isBind !== true ? await this.getTimelineFromArrayReference(timeline.binds) : [];
        this._pauseTimeline(timeline);
        this._executeBids(bindTimelines, 'pause');
        return this;
    }

    /**
     * @param {TimelineEntity} timeline
     * @return {TimelineService}
     */
    async resume(timeline) {
        if (this.isRunning(timeline)) {
            return;
        }

        let bindTimelines = timeline.isBind !== true ? await this.getTimelineFromArrayReference(timeline.binds) : [];
        this._restoreTimeline(timeline, TimelineService.RESUME);
        this._executeBids(bindTimelines, 'resume');
        return this;
    }

    /**
     * @param {TimelineEntity} timeline
     * @param {second} second
     * @returns {Promise}
     */
    async changeTime(timeline, second) {


        if (!this.isRunning(timeline)) {
            return;
        }


        let running = this.getRunningTimeline(timeline);

        if (!running) {
            console.warn('Timeline not running', timeline, second);
            return;
        }

        let timeToShift = new (require("@dsign/library").date.Time)();
        timeToShift.sumSeconds(second);
        if (running.time.getDuration() <= timeToShift.getDuration()) {
            console.warn('Second too long', timeline, second);
            return;
        }

        running.timer = timeToShift;
        this._restoreTimeline(timeline, TimelineService.CHANGE_TIME);
    }


    /**
     * @param {Array} references
     * @return {Promise}
     */
    getTimelineFromArrayReference(references) {
        let timelines = [];
        for (let cont = 0; references.length > cont; cont++) {
            timelines.push(this.timelineStorage.get(references[cont].id));
        }
        return Promise.all(timelines);
    }

    /**
     * @param {Array} timelines
     * @param {String} method
     * @private
     */
    _executeBids(timelines, method) {
        for (let cont = 0; timelines.length > cont; cont++) {
            timelines[cont].isBind = true;
            this[method](timelines[cont])
                .catch((err) => {console.error('Error bind timeline service', err)});
        }
    }

    /**
     * @param type
     * @param timeline
     * @param timeslot
     * @param data
     * @private
     */
    _send(type, timeline, timeslot = null, data = null) {

        let message = {
            event : type,
            data : {
                timeslot : timeslot,
                context : {
                    serviceId: timeline.id
                }
            }
        };


        if(data) {
            message.data.data = data;
        }
        console.log('TIMELINE', message);
        this.sender.send('proxy', message);
    }

    /**
     * @param {TimeslotEntity} timeslot
     * @param {TimelineEntity} timeline
     * @private
     */
    _injectDataFromTimeline(timeslot, timeline) {
        timeslot.enableAudio = timeline.enableAudio;
        timeslot.context = timeline.context;
    }
}

module.exports = TimelineService;