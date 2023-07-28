import { AbstractResourceSenderService } from "./../../resource/src/AbstractResourceSenderService";
import { PlaylistEntity } from "./entity/PlaylistEntity";
import { ResourceSenderEntity } from "./../../resource/src/entity/ResourceSenderEntity";

/**
 * @class PlaylistService
 */
export class PlaylistService extends AbstractResourceSenderService {

    /**
     * @param {Storage} resourceStorage
     * @param {Timer} timer
     * @param {ContainerAggregate} dataInjectorManager
     * @param {Storage} playlistStorage
     */
    constructor(resourceStorage, timer, dataInjectorManager, playlistStorage) {

        super(resourceStorage, timer, dataInjectorManager);

        /**
         * @type {Storage}
         */
        this.playlistStorage = playlistStorage;

        /**
         * List running playlist
         * @type {Object}
         */
        this.runningPlaylist = {};

        this.timer.addEventListener('secondTenthsUpdated', (evt) => {
            this._schedule();
        });
    }

    /**
     * @param {CustomEvent} evt 
     */
    _updateResourceSender(evt) {
            
        this.playlistStorage.update(evt.data.context.entity)
            .then((entity) => {
                console.log('Update service playlist', entity.name);
            })
    }
    

    /**
     * @private
     */
    _schedule() {

        this._scheduleRunningPlaylist();
        this._updateRunningPlaylist();
    }

    async _scheduleRunningPlaylist() {
        for (let property in this.runningPlaylist) {

            let resource = this.runningPlaylist[property].current();
            let playlist = this.runningPlaylist[property];
            let data;

            switch (true) {
                // LOOP PLAYLIST
                case playlist.hasNext() === false && playlist.getStatus() === PlaylistEntity.RUNNING && resource.getDuration() <= resource.getCurrentTime() && playlist.getRotation() === PlaylistEntity.ROTATION_LOOP:

                    playlist.reset();
                    // TODO SEND RESOURCE
                    data = await this._extractData(playlist.current());
                    this.emitResourceEvt(PlaylistService.PLAY, playlist, data);
                    break;
                // NEXT PLAYLIST
                case playlist.hasNext() === true && playlist.getStatus() === PlaylistEntity.RUNNING && resource.getDuration() <= resource.getCurrentTime():
                    resource.currentTime = 0;
                    playlist.next();
                    // TODO SEND RESOURCE
                    data = await this._extractData(playlist.current());
                    this.emitResourceEvt(PlaylistService.PLAY, playlist, data);
                    break;
                // STOP PLAYLIST
                case playlist.hasNext() === false && playlist.getStatus() === PlaylistEntity.RUNNING && resource.getDuration() <= resource.getCurrentTime():

                    this.stop(playlist);
                    this.emitResourceEvt(PlaylistService.STOP, playlist);
                    // TODO SEND RESOURCE
                    break;
            }
        }
    }

    _updateRunningPlaylist() {

        for (let property in this.runningPlaylist) {

            let playlist = this.runningPlaylist[property];
            let resource = playlist.current();
            
            resource.setCurrentTime(
                parseFloat(resource.getCurrentTime() + 0.1).toFixed(1)
            );
            
           /*
            resource.setCurrentTime(
                resource.getCurrentTime() + 1
            );
*/
            //console.log('Playlist time', playlist.name, resource.name, resource.currentTime);
            this.getEventManager().emit(PlaylistService.UPDATE_TIME, playlist);
        }
    }

    /**
     * @param {PlaylistEntity} entity 
     */
    _setRunningPlaylist(playlist) {
        let context = `${playlist.monitorContainerReference.id}-${playlist.context}`;
        this.runningPlaylist[context] = playlist;
    }

    /**
     * @param {PlaylistEntity} playlist 
     */
    _removeRunningPlaylist(playlist) {
        let context = `${playlist.monitorContainerReference.id}-${playlist.context}`;
        if (this.runningPlaylist[context] && this.runningPlaylist[context].id === playlist.id) {
            delete this.runningPlaylist[context];
        }
    }

    /**
     * @param {PlaylistEntity} playlist 
     */
    _getRunningPlaylist(playlist) {
        let context = `${playlist.monitorContainerReference.id}-${playlist.context}`;
        return this.runningPlaylist[context] ? this.runningPlaylist[context] : null;
    }

    /**
     * @param {PlaylistEntity} entity
     * @return {Promise}
     */
    async play(playlist) {
        console.log('PLAY');
        playlist = await this._loadResources(playlist);

        // TODO PAUSE RUNNING PLAYLIST
        let runningPlaylist = this._getRunningPlaylist(playlist);
        if (runningPlaylist) {
            this.pause(runningPlaylist);
        }

        this._setRunningPlaylist(playlist);
        playlist.status = PlaylistEntity.RUNNING;

        /**
         * Recover metadata
         */
        let data = await this._extractData(playlist.current());

        /**
         * Binds
         */
        if (playlist.getBinds().length > 0) {
            this._scheduleBinds(entity.getBinds(), 'play');
        }

        this.emitResourceEvt(PlaylistService.PLAY, playlist, data);
    }

    /**
     * @param {PlaylistEntity} entity
     * @return {Promise}
     */
    async resume(playlist) {
        console.log('RESUME');
        playlist = await this._loadResources(playlist);

        let runningPlaylist = this._getRunningPlaylist(playlist);
        if (runningPlaylist) {
            this.pause(runningPlaylist);
        }

        this._setRunningPlaylist(playlist);
        playlist.status = PlaylistEntity.RUNNING;

        /**
         * Recover metadata
         */
        let data = await this._extractData(playlist.current());

        /**
         * Binds
         */
        if (playlist.getBinds().length > 0) {
            this._scheduleBinds(entity.getBinds(), 'resume');
        }


        this.emitResourceEvt(PlaylistService.RESUME, playlist, data);
    }

    /**
     * @param {PlaylistEntity} entity
     * @return {Promise}
     */
    async pause(playlist) {
        console.log('PAUSE');
        let runningPlaylist = this._getRunningPlaylist(playlist);
        if (!runningPlaylist) {
            return;
        }

        this._removeRunningPlaylist(playlist);
        runningPlaylist.status = PlaylistEntity.PAUSE;

        /**
         * Binds
         */
        if (runningPlaylist.getBinds().length > 0) {
            this._scheduleBinds(runningPlaylist.getBinds(), 'pause');
        }

        this.emitResourceEvt(PlaylistService.PAUSE, playlist);
    }

    /**
     * @param {PlaylistEntity} entity
     * @return {Promise}
     */
    async stop(playlist) {
        console.log('STOP');

        let runningPlaylist = this._getRunningPlaylist(playlist);
        if (!runningPlaylist) {
            playlist.status = PlaylistEntity.IDLE;
            playlist.reset();
            this.emitResourceEvt(PlaylistService.STOP, playlist);
            return;
        }

        this._removeRunningPlaylist(playlist);
        runningPlaylist.status = PlaylistEntity.IDLE;
        runningPlaylist.reset();

        /**
         * Binds
         */
        if (runningPlaylist.getBinds().length > 0) {
            this._scheduleBinds(runningPlaylist.getBinds(), 'stop');
        }

        this.emitResourceEvt(PlaylistService.STOP, runningPlaylist);
    }

    /**
     * @param {array} binds 
     * @param {string} method 
     */
    _scheduleBinds(binds, method) {
        for (let cont = 0; binds.length > cont; cont++) {
            console.log('BINDSSSSSSSSSSSS', method, binds[cont]);
            this[method](binds[cont])
                .catch(
                    (err) => {
                        console.error('Error bind resource service', err)
                    });
        }
    }

    async _loadResources(playlist) {
        let promises = [];

        for (let cont = 0; playlist.resources.length > cont; cont++) {
            promises.push(this.resourceStorage.get(playlist.resources[cont].id));
        }

        let resources = await Promise.all(promises);

        for (let cont = 0; resources.length > cont; cont++) {
            let index = playlist.resources.findIndex((ele) => {
                return ele.id === resources[cont];
            });

            if (index > -1) {
                playlist.resources[index] = Object.assign(resources[cont], playlist.resources[index]);
            }

        }

        return playlist;
    }

    /**
     * @param {*} nameEvt 
     * @param {*} playlist 
     */
    emitResourceEvt(nameEvt, playlist, data) {

        let resourceSenderEntity = new ResourceSenderEntity();
        resourceSenderEntity.monitorContainerReference = playlist.monitorContainerReference;
        resourceSenderEntity.resourceReference = playlist.current();

        let evtData = {
            resource: resourceSenderEntity,
            context : {
                serviceId: playlist.id,
                entity: playlist
            }
        }

        if (data) {
            evtData.data = data;
        }

        this.getEventManager().emit(nameEvt, evtData);
    }

    async changeTime(entity, second) {
        let runningPlaylist = this._getRunningPlaylist(playlist);

        if (!runningPlaylist) {
            console.warn('Playlist not running', entity, second);
            return;
        }
    }
}
