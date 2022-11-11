const PlaylistService = (async () => {   
    
    const { AbstractTimeslotService } = await import(`${container.get('Application').getBasePath()}module/timeslot/src/AbstractTimeslotService.js`);
    const { PlaylistEntity } = await import(`./entity/PlaylistEntity.js`);
  

    /**
     * @class PlaylistService
     */
    class PlaylistService extends AbstractTimeslotService {

        /**
         * @param {Storage} timeslotStorage
         * @param {AbstractSender} sender
         * @param {Timer} timer
         * @param {ContainerAggregate} dataInjectorManager
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
         * @param {PlaylistEntity} playlist
         * @return {boolean}
         */
        isRunning(playlist) {

            let isRunning = false;
            switch (true) {
                case this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_STANDARD}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_STANDARD}`].id === playlist.id:
                    isRunning = true;
                    break;
                case this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_OVERLAY}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_OVERLAY}`].id === playlist.id:
                    isRunning = true;
                    break;
                case this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_DEFAULT}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_DEFAULT}`].id === playlist.id:
                    isRunning = true;
                    break;
            }
            return isRunning;
        }

        /**
         * @param {PlaylistEntity}  playlist
         * @returns {PlaylistEntity}
         */
        getPlaylist(playlist) {
            let running = null;
            switch (true) {
                case this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_STANDARD}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_STANDARD}`].id === playlist.id:
                    running = this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_STANDARD}`];
                    break;
                case this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_OVERLAY}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_OVERLAY}`].id === playlist.id:
                    running = this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_OVERLAY}`];
                    break;
                case this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_DEFAULT}`] !== undefined &&
                this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_DEFAULT}`].id === playlist.id:
                    running = this.runningPlaylist[`${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_DEFAULT}`].id === playlist;
                    break;
            }
            return running
        }

        /**
         * @param {PlaylistEntity} playlist
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
         * @param {string} context
         * @return {string} context
         */
        getRunningPlaylist(monitorId, context) {
            return this.runningPlaylist[`${monitorId}-${context}`];
        }

        /**
         * @param {PlaylistEntity} playlist
         * @private
         */
        _removeRunningPlaylist(playlist) {

            let nameContext = `${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_OVERLAY}`;
            if (this.runningPlaylist[nameContext] && this.runningPlaylist[nameContext].id === playlist.id) {
                delete this.runningPlaylist[nameContext];
            }

            nameContext = `${playlist.getMonitorId()}-${PlaylistEntity.CONTEXT_STANDARD}`;
            if (this.runningPlaylist[nameContext] && this.runningPlaylist[nameContext].id === playlist.id) {
                delete this.runningPlaylist[nameContext];
            }
        }

        /**
         * @private
         */
        _scheduleRunningPlaylist() {
            for (let property in this.runningPlaylist) {

                let timeslotPlaylistRef = this.runningPlaylist[property].current();
                switch (true) {
                    /**
                     * Loop playlist
                     */
                    case this.runningPlaylist[property].hasNext() === false && this.runningPlaylist[property].status === PlaylistEntity.RUNNING && timeslotPlaylistRef.getDuration() <= timeslotPlaylistRef.getCurrentTime() && this.runningPlaylist[property].rotation === PlaylistEntity.ROTATION_LOOP:
                        console.log('LOOP playlist', this.runningPlaylist[property].name);
                        this.runningPlaylist[property].reset();
                        this._sendNextTimeslot(this.runningPlaylist[property], this.runningPlaylist[property].first());
                        break;
                    /**
                     * Next item in the playlist
                     */
                    case this.runningPlaylist[property].hasNext() === true && this.runningPlaylist[property].status === PlaylistEntity.RUNNING && timeslotPlaylistRef.getDuration() <= timeslotPlaylistRef.getCurrentTime():
                        console.log('NEXT playlist', this.runningPlaylist[property].name);
                        timeslotPlaylistRef.currentTime = 0;
                        this._sendNextTimeslot(this.runningPlaylist[property], this.runningPlaylist[property].next());
                        break;
                    /**
                     * Stop playlist
                     */
                    case this.runningPlaylist[property].hasNext() === false && this.runningPlaylist[property].status === PlaylistEntity.RUNNING && timeslotPlaylistRef.getDuration() <= timeslotPlaylistRef.getCurrentTime():
                        console.log('STOP playlist', this.runningPlaylist[property].name);
                        this._stopPlaylist( this.runningPlaylist[property]);
                        break;
                }
            }
        }

        /**
         * @param {PlaylistEntity} playlist
         * @return {Promise}
         */
        async play(playlist) {
            let timeslot = await this.timeslotStorage.get(playlist.first().getId());
            if (!timeslot) {
                // TODO ADD exception????
                return;
            }

            let bindPlaylists = playlist.isBind !== true ? await this.getPlaylistFromArrayReference(playlist.binds) : [];
            let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
            this._playPlaylist(playlist, timeslot, dataTimeslot);
            this._executeBids(bindPlaylists, 'play');
            this.getEventManager().emit(PlaylistService.PLAY, playlist);
        }

        /**
         * @param {PlaylistEntity} playlist
         * @return {Promise}
         */
        async stop(playlist) {

            let bindPlaylists = playlist.isBind !== true ? await this.getPlaylistFromArrayReference(playlist.binds) : [];
            this._stopPlaylist(playlist);
            this._executeBids(bindPlaylists, 'stop');
            this.getEventManager().emit(PlaylistService.STOP, playlist);
        }

        /**
         * @param {PlaylistEntity} playlist
         * @return {Promise}
         */
        async resume(playlist) {

            let timeslotPlaylistReference = playlist.current();
            let timeslot = await this.timeslotStorage.get(timeslotPlaylistReference.id);
            if (!timeslot) {
                // TODO ADD exception????
                return;
            }

            let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
            let bindPlaylists = playlist.isBind !== true ? await this.getPlaylistFromArrayReference(playlist.binds) : [];
            timeslot.currentTime = timeslotPlaylistReference.currentTime;
            this._resumePlaylist(playlist, timeslot, dataTimeslot);
            this._executeBids(bindPlaylists, 'resume');
            this.getEventManager().emit(PlaylistService.RESUME, playlist);
        }

        /**
         * @param {PlaylistEntity} playlist
         * @return {Promise}
         */
        async pause(playlist) {

            let bindPlaylists = playlist.isBind !== true ? await this.getPlaylistFromArrayReference(playlist.binds) : [];
            this._pausePlaylist(playlist);
            this._executeBids(bindPlaylists, 'pause');
            this.getEventManager().emit(PlaylistService.PAUSE, playlist);
        }

        /**
         * @param {PlaylistEntity} playlist
         * @param {second} second
         * @returns {Promise<void>}
         */
        async changeTime(playlist, second) {
            if (!this.isRunning(playlist)) {
                return;
            }

            let running = this.getPlaylist(playlist);

            if (!running) {
                console.warn('Playlist not running', playlist, second);
                return;
            }

            if (running.getDuration() <= second) {
                console.warn('Playlist too long', playlist, second);
                return;
            }

            playlist.setSecond(second);
            let timeslot = await this.timeslotStorage.get(playlist.current().getId());
            timeslot.currentTime = playlist.current().currentTime;

            let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
            // TODO synch if there are bind playlist
            this._changeTimeTimeslot(playlist, timeslot, dataTimeslot);
        }

        /**
         * @param {PlaylistEntity} playlist
         * @param {EntityReference} refTimeslotPlaylist
         * @private
         */
        async _sendNextTimeslot(playlist, refTimeslotPlaylist) {
            let timeslot = await this.timeslotStorage.get(refTimeslotPlaylist.id);
            if (!timeslot) {
                // TODO ADD exception????
                return;
            }

            //this._executeBids(playlist, 'resume');
            let dataTimeslot = await this._synchExtractTimeslotData(timeslot);
            timeslot.currentTime = 0;
            this._injectDataFromPlaylist(timeslot, playlist);
            this._send(PlaylistService.PLAY, playlist, timeslot, dataTimeslot);
            this.getEventManager().emit(PlaylistService.PLAY, playlist);
        }

        /**
         * @param {PlaylistEntity} playlist
         * @param {TimeslotEntity} timeslot
         * @param {Object} dataTimeslot
         * @private
         */
        _playPlaylist(playlist, timeslot, dataTimeslot = null) {

            let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
            if (runningPlaylist) {
                this.pause(runningPlaylist);
            }

            this.setRunningPlaylist(playlist);
            playlist.status = PlaylistEntity.RUNNING;

            timeslot.currentTime = 0;
            this._injectDataFromPlaylist(timeslot, playlist);
            this._send(PlaylistService.PLAY, playlist, timeslot, dataTimeslot);
            this.playlistStorage.update(playlist)
                .then((data) => { console.log('PLAY playlist EVT')})
                .catch((err) => { console.error(err)});
        }

        /**
         * @param {PlaylistEntity} playlist
         * @param {TimeslotEntity} timeslot
         * @param {Object} dataTimeslot
         * @private
         */
        _resumePlaylist(playlist, timeslot, dataTimeslot = null) {

            let runningPlaylist = this.getRunningPlaylist(playlist.getMonitorId(), playlist.context);
            if (runningPlaylist) {
                this.pause(runningPlaylist);
            }

            this.setRunningPlaylist(playlist);
            playlist.status = PlaylistEntity.RUNNING;
            this._injectDataFromPlaylist(timeslot, playlist);
            this._send(PlaylistService.RESUME, playlist, timeslot, dataTimeslot);
            this.playlistStorage.update(playlist)
                .then((data) => { console.log('RESUME playlist EVT')})
                .catch((err) => { console.error(err)});
        }

        /**
         * @param {PlaylistEntity} playlist
         * @private
         */
        _pausePlaylist(playlist) {
            playlist.status = PlaylistEntity.PAUSE;
            this._removeRunningPlaylist(playlist);
            this._send(PlaylistService.PAUSE, playlist, playlist.current());
            this.playlistStorage.update(playlist)
                .then((data) => { console.log('PAUSE playlist EVT')})
                .catch((err) => { console.error(err)});

        }

        /**
         * @param {PlaylistEntity} playlist
         * @private
         */
        _stopPlaylist(playlist) {
            playlist.status = PlaylistEntity.IDLE;
            this._send(PlaylistService.STOP, playlist, playlist.current());
            playlist.reset();
            this.playlistStorage.update(playlist)
                .then((data) => { console.log('STOP playlist EVT')})
                .catch((err) => { console.error(err)});
            this._removeRunningPlaylist(playlist);
        }

        /**
         * @private
         */
        _changeTimeTimeslot(playlist, timeslot, dataTimeslot) {

            this._injectDataFromPlaylist(timeslot, playlist);
            this._send(PlaylistService.CHANGE_TIME, playlist, timeslot, dataTimeslot);
            this.playlistStorage.update(playlist)
                .then((data) => { console.log('CHANGE_TIME playlist EVT')})
                .catch((err) => { console.error(err)});
        }

        /**
         * @private
         */
        _updateRunnintPlaylist() {

            for (let property in this.runningPlaylist) {

                let playlist = this.runningPlaylist[property];
                let timeslotPlaylistRef = playlist.current();

                timeslotPlaylistRef.currentTime = parseFloat(timeslotPlaylistRef.getCurrentTime() + 0.1).toFixed(1);
                this.playlistStorage.update(playlist)
                    .then((data) => {})
                    .catch((err) => { console.log(err) });
            }
        }

        /**
         * @param {Array} playlists
         * @param {String} method
         * @private
         */
        _executeBids(playlists, method) {
            for (let cont = 0; playlists.length > cont; cont++) {
                playlists[cont].isBind = true;
                this[method](playlists[cont])
                    .catch((err) => {console.error('Error bind timeslot service', err)});
            }
        }

        /**
         *
         * @param {string} type
         * @param {PlaylistEntity} playlist
         * @param {TimeslotEntity} timeslot
         * @param {Object} data
         * @private
         */
        _send(type, playlist, timeslot = null, data = null) {

            let message = {
                event : type,
                data : {
                    timeslot : timeslot,
                    context : {
                        serviceId: playlist.id
                    }
                }

            };

            if(data) {
                message.data.data = data;
            }
        //    console.log('PLAYLIST', message);
            this.sender.send('proxy', message);
        }

        /**
         * @param {Array<EntityReference>} references
         * @return {Promise}
         */
        getPlaylistFromArrayReference(references) {
            let playlists = [];
            for (let cont = 0; references.length > cont; cont++) {
                playlists.push(this.playlistStorage.get(references[cont].getId()));
            }
            return Promise.all(playlists);
        }

        /**
         * @param {TimeslotEntity} timeslot
         * @param {PlaylistEntity} playlist
         * @private
         */
        _injectDataFromPlaylist(timeslot, playlist) {
            timeslot.enableAudio = playlist.enableAudio;
            timeslot.context = playlist.context;
        }
    }
    
    return {PlaylistService: PlaylistService};
})();

export default PlaylistService;
export const then = PlaylistService.then.bind(PlaylistService);