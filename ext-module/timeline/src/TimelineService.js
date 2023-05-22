const TimelineService = (async () => {        

    const { AbstractTimeslotService } = await import(`${container.get('Application').getBasePath()}module/timeslot/src/AbstractTimeslotService.js`);
    const { TimeslotEntity } = await import(`${container.get('Application').getBasePath()}module/timeslot/src/entity/TimeslotEntity.js`);
    const { TimelineEntity } = await import(`./entity/TimelineEntity.js`);
    const { Time } = await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
    /**
     * @class TimelineService
     */
    class TimelineService extends AbstractTimeslotService {

        /**
         * @param {Storage} timeslotStorage
         * @param {AbstractSender} sender
         * @param {Timer} timer
         * @param {ContainerAggregate} dataInjectorManager
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

            this.timer.addEventListener('secondTenthsUpdated', (evt) => {
                this._schedule();
            });
        }

        /**
         * @param evt
         */
        _schedule(evt) {

            this._scheduleRunningTimeline();
            this._updateRunningTimeline();
        }

        /**
         * @private
         */
        _updateRunningTimeline() {

            for (let property in this.runningTimelines) {
                //console.log(this.runningTimelines[property].currentTime);
                //console.log('Update schedule', this.runningTimelines[property].name, this.runningTimelines[property].currentTime, updateTime);
                this.runningTimelines[property].currentTime =  Math.round((this.runningTimelines[property].currentTime + 0.1) * 10) / 10;    ;
            
                this.getEventManager().emit(TimeslotService.UPDATE_TIME, this.runningTimelines[property]);
            }
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
         * @param {TimelineEntity} timeline
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
         * @param {TimelineEntity} timeline
         * @return boolean
         * @private
         */
        isRunning(timeline) {
            return !!this.runningTimelines[timeline.id];
        }

        /**
         * @param {TimelineEntity} timeline
         * @return {TimelineEntity|null}
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
        _scheduleRunningTimeline() {
            for (let property in this.runningTimelines) {

                // TODO reimpost loop
                switch (true) {
                    // Loop controll
                    case this.runningTimelines[property].status === TimeslotEntity.RUNNING &&
                         this.runningTimelines[property].currentTime > this.runningTimelines[property].getDuration() &&
                         this.runningTimelines[property].rotation === TimeslotEntity.ROTATION_LOOP:
                        this.runningTimelines[property].timer.reset();
                        this._checkTimeslotToStart(this.runningTimelines[property]);
                        break;
                    // Stop controll
                    case this.runningTimelines[property].status === TimeslotEntity.RUNNING &&
                         this.runningTimelines[property].currentTime > this.runningTimelines[property].getDuration() :
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
         * @param {TimelineEntity} timeline
         */
        _checkTimeslotToStart(timeline) {


            if (timeline.hasCurrentTimeItem()) {
                let item = timeline.getCurrentTimeItem();
                if (item.timeslotReferences.length > 0) {
                    this._runTimelineItem(TimelineService.PLAY, timeline, item);
                }
            }
        }

        /**
         * @param {string} type (play or resume)
         * @param {TimelineEntity} timeline
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
         * @return {TimelineService}
         */
         async play(timeline) {
            if (this.isRunning(timeline)) {
                return;
            }

            let bindTimelines = timeline.isBind !== true ? await this.getTimelineFromArrayReference(timeline.binds) : [];
            this._playTimeline(timeline);
            this._executeBids(bindTimelines, 'play');
            return this;
        }

        /**
         * @param {TimelineEntity} timeline
         * @param {TimelineEntity} timeslot
         * @private
         */
        _playTimeline(timeline, timeslot) {
           
            timeline.status = TimeslotEntity.RUNNING;
            timeline.currentTime = 0;
            if (this.isRunning(timeline) === false) {
                this._addRunningTimeline(timeline);
            }

            this._send(TimelineService.PLAY, timeline);
            this.timelineStorage.update(timeline)
                .then((data) => {
                    // console.log('STOP timeline')
                }).catch((err) => { console.error(err)});

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
         * @private
         */
        _stopTimeline(timeline) {
            // TODO add event timeline
            timeline.status = TimeslotEntity.IDLE;
            timeline.currentTime = 0;
            this._send(TimelineService.STOP, timeline);
            this.timelineStorage.update(timeline)
                .then((data) => {
                    // console.log('STOP timeline')
                }).catch((err) => { console.error(err)});
            this._removeRunningTimeline(timeline);
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
         * @return {TimelineService}
         */
        async resume(timeline) {
            if (this.isRunning(timeline)) {
                return;
            }

            let bindTimelines = timeline.isBind !== true ? await this.getTimelineFromArrayReference(timeline.binds) : [];
            this._resumeTimeline(timeline, TimelineService.RESUME);
            this._executeBids(bindTimelines, 'resume');
            return this;
        }

        /**
         * @param {TimelineEntity} timeline
         * @private
         */
         _resumeTimeline(timeline, event) {

            timeline.status = TimeslotEntity.RUNNING;
            let item = timeline.getCurrentTimePreviuosItem();
            // TODO control time timeslot in timeline
            let time = new Time();
            time.sumSeconds(timeline.currentTime);
            this._runTimelineItem(event, timeline, item, item.time.getDiffSecond(time));
            this._addRunningTimeline(timeline);

            this.timelineStorage.update(timeline)
                .then((data) => {
                    //console.log('RESUME timeline')
                }).catch((err) => { console.error(err)});
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

            let timeToShift = new Time();
            timeToShift.sumSeconds(second);
            if (running.getDuration() < timeToShift.getDuration()) {
                console.warn('Second too long', timeline, second);
                return;
            }

            running.currentTime = timeToShift.getDuration();
            this._resumeTimeline(running, TimelineService.CHANGE_TIME);
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
    return {TimelineService: TimelineService};
})();

export default TimelineService;
export const then = TimelineService.then.bind(TimelineService);