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
        this._scheduleRunningTimeline();
        this._updateRunningTimeline();
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
    _hasRunningTimeline(timeline) {
        return !!this.runningTimelines[timeline.id];
    }

    /**
     * @param {Timeline} timeline
     * @return {Timeline|null}
     */
    getRunningTimeline(timeline) {
        let runningTimeline = null;
        if (this._hasRunningTimeline(timeline)) {
            runningTimeline = this.runningTimelines[timeline.id];
        }
        return runningTimeline;
    }

    /**
     * @private
     */
    _updateRunningTimeline() {

        for (let property in this.runningTimelines) {
            if (this.runningTimelines[property].status === Timeslot.RUNNING) {
                this.runningTimelines[property].timer.sumSeconds(1);
                this.timelineStorage.update(this.runningTimelines[property])
                    .then((data) => { console.log('update timeline')})
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
            if (this.runningTimelines[property].status === Timeline.TO_RUN) {
                this.runningTimelines[property].status = Timeslot.RUNNING;
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
                case this.runningTimelines[property].status === Timeslot.RUNNING &&
                        this.runningTimelines[property].timer.compare(this.runningTimelines[property].time) > -1 &&
                        this.runningTimelines[property].rotation === Timeslot.ROTATION_LOOP:
                    this.runningTimelines[property].timer.reset();
                    this._checkItemsInTimeline(this.runningTimelines[property]);
                    break;
                case this.runningTimelines[property].status === Timeslot.RUNNING &&
                        this.runningTimelines[property].timer.compare(this.runningTimelines[property].time) > -1 :
                    // TODO event
                    this._stopTimeline( this.runningTimelines[property]);
                    break;

                case this.runningTimelines[property].status === Timeslot.RUNNING:
                    this._checkItemsInTimeline(this.runningTimelines[property]);
                    break;
            }
        }
    }

    /**
     * @param {Timeline} timeline
     */
    _checkItemsInTimeline(timeline) {

        if (timeline.hasItem(timeline.timer)) {
            let item = timeline.getItem(timeline.timer);
            if (item.hasTimeslotReference()) {
                this._runTimelineItem(timeline, item);
            }
        }
    }

    /**
     * @param {Timeline} timeline
     * @param {TimelineItem} item
     * @param {number} delay
     */
    _runTimelineItem(timeline, item, delay = 0) {
        let promises = [];

        for (let cont = 0; item.timeslotReferences.length > cont; cont++) {
            promises.push(this.timeslotStorage.get(item.timeslotReferences[cont].referenceId));
        }

        Promise.all(promises).then((timeslots) => {
            //console.log('SE FEM', timeslots, this);
            for (let cont = 0; timeslots.length > cont; cont++) {
                // TODO inject data
                timeslots[cont].currentTime = delay;
                timeslots[cont].context = timeline.context;
                this._playTimeslot(timeline, timeslots[cont]);
            }
        })
    }

    /**
     * @param {Timeline} timeline
     * @param {Timeslot} timeslot
     * @private
     */
    _playTimeslot(timeline, timeslot) {
        this._send(TimelineService.PLAY, timeline, timeslot);
    }


    /**
     * @param {Timeline} timeline
     * @private
     */
    _stopTimeline(timeline) {
        // TODO add event timeline
        timeline.status = Timeslot.IDLE;
        timeline.timer.reset();
        this._send(TimelineService.STOP, timeline);
        this.timelineStorage.update(timeline)
            .then((data) => { console.log('STOP timeline')})
            .catch((err) => { console.error(err)});
        this._removeRunningTimeline(timeline);
    }

    /**
     * @param {Timeline} timeline
     * @private
     */
    _pauseTimeline(timeline) {

        timeline.status = Timeslot.PAUSE;
        this._send(TimelineService.PAUSE, timeline);
        this.timelineStorage.update(timeline)
            .then((data) => { console.log('PAUSE timeline')})
            .catch((err) => { console.error(err)});
        this._removeRunningTimeline(timeline);
    }

    /**
     * @param {Timeline} timeline
     * @private
     */
    _resumeTimeline(timeline) {

        timeline.status = Timeslot.RUNNING;
        let item = timeline.getPreviousItem(timeline.timer);
        // TODO control time timeslot in timeline
        this._runTimelineItem(timeline, item, item.time.getDiffSecond(timeline.timer));
        this._addRunningTimeline(timeline);

        this.timelineStorage.update(timeline)
            .then((data) => { console.log('RESUME timeline')})
            .catch((err) => { console.error(err)});
    }

    /**
     *
     * @param {string} type
     * @param {Timeline} timeline
     * @param {Timeslot} timeslot
     * @private
     */
    _send(type, timeline, timeslot = null) {

        let message = {
            context : { serviceId: timeline.id }
        };

        if (timeslot) {
            message. timeslot = timeslot
        }

        this.sender.send(type, message);
    }

    /**
     * @param {Timeline} timeline
     * @return {TimelineService}
     */
    play(timeline) {
        if (this._hasRunningTimeline(timeline)) {
            return;
        }

        timeline.status = Timeline.TO_RUN;
        if (this._hasRunningTimeline(timeline) === false) {
            this._addRunningTimeline(timeline);
        }
        return this;
    }

    /**
     * @param {Timeline} timeline
     * @return {TimelineService}
     */
    stop(timeline) {
        this._stopTimeline(timeline);
        return this;
    }

    /**
     * @param {Timeline} timeline
     * @return {TimelineService}
     */
    pause(timeline) {
        if (!this._hasRunningTimeline(timeline)) {
            return;
        }

        this._pauseTimeline(timeline);
        return this;
    }

    /**
     * @param {Timeline} timeline
     * @return {TimelineService}
     */
    resume(timeline) {
        if (this._hasRunningTimeline(timeline)) {
            return;
        }

        this._resumeTimeline(timeline);
        return this;
    }
}

module.exports = TimelineService;