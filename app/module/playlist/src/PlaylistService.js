/**
 *
 */
class PlaylistService extends TimeslotService {

    /**
     *
     * @param {Storage} playlistStorage
     * @param sender
     * @param {Timer} timer
     * @param {TimeslotDataInjectorServicePluginManager} dataInjectorManager
     */
    constructor(playlistStorage, sender, timer, dataInjectorManager) {

        super(playlistStorage, sender, timer, dataInjectorManager);

        /**
         * TODO refactor
         * Clear parent data
         */
        delete this.runningTimeslots;

        /**
         * List running playlist
         * @type {Object}
         */
        this.runningPlaylist = {};

        this.eventManager.remove(TimeslotService.PLAY);
        this.eventManager.remove(TimeslotService.STOP);
        this.eventManager.remove(TimeslotService.PAUSE);
        this.eventManager.remove(TimeslotService.RESUME);
        /**
         * Listeners
         */
        this.eventManager.on(PlaylistService.PLAY, this.changeRunningPlaylist.bind(this));
        this.eventManager.on(PlaylistService.STOP, this.changeIdlePlaylist.bind(this));
        this.eventManager.on(PlaylistService.PAUSE, this.changePausePlaylist.bind(this));
        this.eventManager.on(PlaylistService.RESUME, this.changeResumePlaylist.bind(this));
    }

    schedule() {

        /**removeRunningTimeslot
        let data = {
            timelineSeconds : this.timer.getTotalTimeValues().seconds
        };

        this.eventManager.fire(`timeline-${data.timelineSeconds}`, data, true);
**/
        let data = {
            timelineSecondsTenths : this.timer.getTotalTimeValues().secondTenths
        };

        this.eventManager.fire(`timeline-${data.timelineSecondsTenths}`, data, true);
        this._updateRunnintPlaylist();
    }
    /**
     *
     * @param {Playlist} playlist
     * @return {boolean}
     */
    isRunning(playlist) {

        let isRunning = false;
        switch (true) {
            case this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_STANDARD}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_STANDARD}`].id === playlist.id:
                isRunning = true;
                break;
            case this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_OVERLAY}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_OVERLAY}`].id === playlist.id:
                isRunning = true;
                break;
            case this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_DEFAULT}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${Playlist.CONTEXT_DEFAULT}`].id === playlist.id:
                isRunning = true;
                break;
        }
        return isRunning;
    }

    /**
     * @param {Playlist} playlist
     */
    setRunningPlaylist(playlist) {
        if (!(typeof playlist.getMonitorId === 'function')) {
            return;
        }
        this.runningPlaylist[`${playlist.getMonitorId()}-${playlist.context}`] = playlist;
    }

    /**
     *
     * @param {string} monitorId
     * @return {string} context
     */
    getRunningPlaylist(monitorId, context) {
        return this.runningPlaylist[`${monitorId}-${context}`];
    }

    /**
     * @param {Playlist} playlist
     */
    removeRunningPlaylist(playlist) {

        let nameContext = `${playlist.getMonitorId()}-${Playlist.CONTEXT_OVERLAY}`;
        if (this.runningPlaylist[nameContext] && this.runningPlaylist[nameContext].id === playlist.id) {
            delete this.runningPlaylist[nameContext];
        }

        nameContext = `${playlist.getMonitorId()}-${Playlist.CONTEXT_STANDARD}`;
        if (this.runningPlaylist[nameContext] && this.runningPlaylist[nameContext].id === playlist.id) {
            delete this.runningPlaylist[nameContext];
        }
    }

    /**
     * @param {Playlist} playlist
     */
    play(playlist) {
        let timeslot = playlist.first();
        this._synchExtractTimeslotData(timeslot).then(
            (timeslotData) => {
                let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
                if (runningPlaylist) {
                    this.pause(runningPlaylist);
                }

                this.setRunningPlaylist(playlist);
                this._executeBids(playlist, 'play');
                playlist.status = Playlist.RUNNING;

                this.sender.send(
                    PlaylistService.PLAY,
                    {
                        timeslot : timeslot,
                        context : {playlistId: playlist.id},
                        data : timeslotData
                    }
                );
                this.eventManager.fire(PlaylistService.PLAY, playlist);
                this.eventManager.on(
                    `timeline-${this.timer.getTotalTimeValues().secondTenths + parseInt(timeslot.duration) * 10}`,
                    this.processPlaylist.bind({playlistService : this, playlist: playlist})
                );
            }
        );
    }

    /**
     * @param {Playlist} playlist
     */
    stop(playlist) {

        this.removeRunningPlaylist(playlist);
        this._executeBids(playlist, 'stop');
        playlist.status = Playlist.IDLE;
        let timeslot = playlist.current();
        this.sender.send(
            PlaylistService.STOP,
            {
                timeslot : timeslot,
                context : {playlistId: playlist.id}
            }
        );
        this.eventManager.fire(PlaylistService.STOP, playlist);
    }

    /**
     * @param {Playlist} playlist
     */
    resume(playlist) {
        let timeslot = playlist.current();
        this._synchExtractTimeslotData(timeslot).then(
            (timeslotData) => {
                let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
                if (runningPlaylist) {
                    this.pause(runningPlaylist);
                }

                this.setRunningPlaylist(playlist);
                playlist.status = Playlist.RUNNING;
                this._executeBids(playlist, 'resume');

                this.sender.send(
                    PlaylistService.RESUME,
                    {
                        timeslot : timeslot,
                        context : {playlistId: playlist.id},
                        data : timeslotData
                    }
                );
                this.eventManager.fire(PlaylistService.RESUME, playlist);

                this.eventManager.on(
                    `timeline-${this.timer.getTotalTimeValues().secondTenths + (parseInt(timeslot.duration) - timeslot.currentTime) * 10}`,
                    this.processPlaylist.bind({playlistService : this, playlist: playlist})
                );
            }
        );
    }

    /**
     * @param {Playlist} playlist
     */
    pause(playlist) {

        playlist.status = Playlist.PAUSE;
        this.removeRunningPlaylist(playlist);
        this._executeBids(playlist, 'pause');
        let timeslot = playlist.current();
        this.sender.send(
            PlaylistService.PAUSE,
            {
                timeslot : timeslot,
                context : {playlistId: playlist.id}
            }
        );
        this.eventManager.fire(PlaylistService.PAUSE, playlist);
    }

    /**
     * @param evt
     */
    processPlaylist(evt) {

        console.group();
        console.log('PROCESSS', this.playlist.name, this.playlist.current());
        if (!this.playlistService.isRunning(this.playlist)) {
            console.log('PLAYLIST NOT RUNNING', this.playlist.name, this.playlist);
            return;
        }

        let runningPlaylist =  this.playlistService
            .getRunningPlaylist(this.playlist.getMonitorId(), this.playlist.context);

        let currentTimeslot = runningPlaylist.current();
       // this.playlistService.eventManager._consoleDebug();

        switch (true) {
            case currentTimeslot.currentTime < (currentTimeslot.duration-1):
                // Old event on the same playlist
                console.log('PLAYLIST JUMP' ,this.playlist.name, currentTimeslot.currentTime, currentTimeslot.duration -1 );
                break;
            case runningPlaylist.hasNext():
                let nextTimeslot = runningPlaylist.next();
                console.log('PLAYLIST NEXT', this.playlist.name, nextTimeslot);
                this.playlistService._synchExtractTimeslotData(nextTimeslot).then(
                    (timeslotData) => {
                        this.playlistService.sender.send(
                            PlaylistService.PLAY,
                            {
                                timeslot : nextTimeslot,
                                context : {playlistId: this.playlist.id},
                                data : timeslotData
                            }
                        );
                        this.playlistService.eventManager.on(
                            `timeline-${this.playlistService.timer.getTotalTimeValues().secondTenths + parseInt(nextTimeslot.duration) * 10}`,
                            this.playlistService.processPlaylist.bind({playlistService : this.playlistService, playlist: this.playlist})
                        );
                });
                break;
            case !runningPlaylist.hasNext() && this.playlist.loop:
                console.log('PLAYLIST LOOP', this.playlist.name, this.playlist);
                this.playlistService.play(this.playlist);
                break;
            case runningPlaylist !== undefined:
                console.log('PLAYLIST STOP', this.playlist.name, this.playlist);
                this.playlistService.stop(this.playlist);
                break;
        }
        console.groupEnd();
    }

    /**
     * @param evt
     */
    changeRunningPlaylist(evt) {
        evt.data.reset();
        console.log('START PLAYLIST', evt);
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     *
     * @param evt
     */
    changeIdlePlaylist(evt) {
        evt.data.reset();
        console.log('STOP PLAYLIST', evt);
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     *
     * @param evt
     */
    changePausePlaylist(evt) {
        console.log('PAUSE PLAYLIST', evt);
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }

    /**
     *
     * @param evt
     */
    changeResumePlaylist(evt) {
        console.log('RESUME PLAYLIST', evt);
        this.storage.update(evt.data)
            .then((data) => {})
            .catch((err) => { console.log(err) });
    }


    /**
     * @private
     */
    _updateRunnintPlaylist() {

        for (let key in this.runningPlaylist) {

            let timeslot = this.runningPlaylist[key].timeslots[this.runningPlaylist[key].currentIndex];
            if (!timeslot || timeslot.currentTime >= timeslot.duration) {
                continue;
            }

            this.runningPlaylist[key].timeslots[this.runningPlaylist[key].currentIndex].currentTime = parseFloat(Number(this.runningPlaylist[key].timeslots[this.runningPlaylist[key].currentIndex].currentTime + 0.1).toFixed(2));
            //  this.runningTimeslots[key].currentTime = parseFloat(Number(this.runningTimeslots[key].currentTime + 0.1).toFixed(2));
            this.storage.update(this.runningPlaylist[key])
                .then((data) => {
                })
                .catch((err) => { console.log(err) });
        }
    }

    /**
     * @param {Playlist} playlist
     * @param {String} method
     * @private
     */
    _executeBids(playlist, method) {
        if (playlist.binds === undefined || playlist.binds.length === 0) {
            return;
        }

        for (let cont = 0; playlist.binds.length > cont; cont++) {

            this.storage
                .get(playlist.binds[cont])
                .then((data) => {
                    this[method](data);
                })
                .catch((err) => { console.log(err) });
        }
    }
}

module.exports = PlaylistService;