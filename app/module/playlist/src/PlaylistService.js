/**
 *
 */
class PlaylistService extends AbstractTimeslotService {

    /**
     * @param {Storage} timeslotStorage
     * @param {AbstractSender} sender
     * @param {Timer} timer
     * @param {TimeslotDataInjectorServicePluginManager} dataInjectorManager
     * @param {Storage} playlistStorage
     */
    constructor(timeslotStorage, sender, timer, dataInjectorManager, playlistStorage) {

        super(timeslotStorage, sender, timer, dataInjectorManager);

        /**
         * @type {Storage}
         */
        this.playlistStorage = playlistStorage;

        /**
         * List running playlist
         * @type {Object}
         */
        this.runningPlaylist = {};

        this.timer.addEventListener('secondTenthsUpdated', (evt)  => {
        // this.timer.addEventListener('secondsUpdated', (evt)  => {
            this._schedule();
        });
    }

    /**
     * @private
     */
    _schedule() {

        this._scheduleRunningPlaylist();
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
     * @private
     */
    _removeRunningPlaylist(playlist) {

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
     * @return {Promise}
     */
    async play(playlist) {
        let timeslot = await this.timeslotStorage.get(playlist.first().referenceId);
        if (!timeslot) {
            // TODO ADD exception????
            return;
        }

        //this._executeBids(playlist, 'resume');
        let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
        this._playPlaylist(playlist, timeslot, dataTimeslot);
        this.eventManager.fire(PlaylistService.PLAY, playlist);
    }

    /**
     * @param {Playlist} playlist
     * @return {Promise}
     */
    async stop(playlist) {

        //this._executeBids(playlist, 'stop');
        this._stopPlaylist(playlist);
        this.eventManager.fire(PlaylistService.STOP, playlist);
    }

    /**
     * @param {Playlist} playlist
     * @return {Promise}
     */
    async resume(playlist) {

        let timeslotPlaylistReference = playlist.current();
        let timeslot = await this.timeslotStorage.get(playlist.first().referenceId);
        if (!timeslot) {
            // TODO ADD exception????
            return;
        }

        let dataTimeslot = await this._synchExtractTimeslotData(timeslot);

        timeslot.currentTime = timeslotPlaylistReference.currentTime;
        this._resumePlaylist(playlist, timeslot, dataTimeslot);

        this.eventManager.fire(PlaylistService.RESUME, playlist);
    }

    /**
     * @param {Playlist} playlist
     * @return {Promise}
     */
    async pause(playlist) {

        //this._executeBids(playlist, 'pause');
        this._pausePlaylist(playlist);
        this.eventManager.fire(PlaylistService.PAUSE, playlist);
    }

    /**
     * @private
     */
    _scheduleRunningPlaylist() {
        for (let property in this.runningPlaylist) {

            /**
             * @type [TimeslotPlaylistReference}
             */
            let timeslotPlaylistRef = this.runningPlaylist[property].current();
            switch (true) {
                /**
                 * Loop playlist
                 */
                case this.runningPlaylist[property].hasNext() === false && this.runningPlaylist[property].status === Timeslot.RUNNING && timeslotPlaylistRef.getDuration() <= timeslotPlaylistRef.getCurrentTime() && this.runningPlaylist[property].rotation === Playlist.ROTATION_LOOP:
                    console.log('LOOP playlist', this.runningPlaylist[property].name);
                    this.runningPlaylist[property].reset();
                    this._sendNextTimeslot(this.runningPlaylist[property], this.runningPlaylist[property].first());
                    break;
                /**
                 * Next item in the playlist
                 */
                case this.runningPlaylist[property].hasNext() === true && this.runningPlaylist[property].status === Timeslot.RUNNING && timeslotPlaylistRef.getDuration() <= timeslotPlaylistRef.getCurrentTime():
                    console.log('NEXT playlist', this.runningPlaylist[property].name);
                    timeslotPlaylistRef.currentTime = 0;
                    this._sendNextTimeslot(this.runningPlaylist[property], this.runningPlaylist[property].next());
                    break;
                /**
                 * Stop playlist
                 */
                case this.runningPlaylist[property].hasNext() === false && this.runningPlaylist[property].status === Timeslot.RUNNING && timeslotPlaylistRef.getDuration() <= timeslotPlaylistRef.getCurrentTime():
                    console.log('STOP playlist', this.runningPlaylist[property].name);
                    this._stopPlaylist( this.runningPlaylist[property]);
                    break;
            }
        }
    }

    /**
     * @param {Playlist} playlist
     * @param {TimeslotPlaylistReference} refTimeslotPlaylist
     * @private
     */
    async _sendNextTimeslot(playlist, refTimeslotPlaylist) {
        let timeslot = await this.timeslotStorage.get(refTimeslotPlaylist.referenceId);
        if (!timeslot) {
            // TODO ADD exception????
            return;
        }

        //this._executeBids(playlist, 'resume');
        let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
        timeslot.currentTime = 0;
        timeslot.context = playlist.context;
        this._send(PlaylistService.PLAY, playlist, timeslot, dataTimeslot);
        this.eventManager.fire(PlaylistService.PLAY, playlist);
    }

    /**
     * @param {Playlist} playlist
     * @param {Timeslot} timeslot
     * @param {Object} dataTimeslot
     * @private
     */
    _playPlaylist(playlist, timeslot, dataTimeslot = null) {

        let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
        if (runningPlaylist) {
            this.pause(runningPlaylist);
        }

        this.setRunningPlaylist(playlist);
        playlist.status = Playlist.RUNNING;

        timeslot.currentTime = 0;
        timeslot.context = playlist.context;
        this._send(PlaylistService.PLAY, playlist, timeslot, dataTimeslot);
        this.playlistStorage.update(playlist)
            .then((data) => { console.log('PLAY playlist EVT')})
            .catch((err) => { console.error(err)});
    }

    /**
     * @param {Playlist} playlist
     * @param {Timeslot} timeslot
     * @param {Object} dataTimeslot
     * @private
     */
    _resumePlaylist(playlist, timeslot, dataTimeslot = null) {

        let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
        if (runningPlaylist) {
            this.pause(runningPlaylist);
        }

        this.setRunningPlaylist(playlist);
        playlist.status = Playlist.RUNNING;
        timeslot.context = playlist.context;
        this._send(PlaylistService.RESUME, playlist, timeslot, dataTimeslot);
        this.playlistStorage.update(playlist)
            .then((data) => { console.log('RESUME playlist EVT')})
            .catch((err) => { console.error(err)});
    }

    /**
     * @param {Playlist} playlist
     * @private
     */
    _pausePlaylist(playlist) {
        playlist.status = Timeslot.PAUSE;
        this._removeRunningPlaylist(playlist);
        this._send(PlaylistService.PAUSE, playlist, playlist.current());
        this.playlistStorage.update(playlist)
            .then((data) => { console.log('PAUSE playlist EVT')})
            .catch((err) => { console.error(err)});

    }

    /**
     * @param {Playlist} playlist
     * @private
     */
    _stopPlaylist(playlist) {
        playlist.status = Timeslot.IDLE;
        playlist.reset();
        this._send(PlaylistService.STOP, playlist);
        this.playlistStorage.update(playlist)
            .then((data) => { console.log('STOP playlist EVT')})
            .catch((err) => { console.error(err)});
        this._removeRunningPlaylist(playlist);
    }

    /**
     * @private
     */
    _updateRunnintPlaylist() {

        for (let property in this.runningPlaylist) {

            let timeslotPlaylistRef = this.runningPlaylist[property].current();

            timeslotPlaylistRef.currentTime = parseFloat(timeslotPlaylistRef.getCurrentTime() + 0.1).toFixed(1);
            this.playlistStorage.update(this.runningPlaylist[property])
                .then((data) => {})
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

            // TODO
        }
    }

    /**
     *
     * @param {string} type
     * @param {playlist} playlist
     * @param {Timeslot} timeslot
     * @param {Object} data
     * @private
     */
    _send(type, playlist, timeslot = null, data = null) {

        let message = {
            context : { serviceId: playlist.id }
        };

        if (timeslot) {
            message. timeslot = timeslot
        }

        if(data) {
            message.data = data;
        }

        this.sender.send(type, message);
    }
}

module.exports = PlaylistService;