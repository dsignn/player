import { EventManagerAware } from "@dsign/library/commonjs/event/EventManagerAware";
import { Storage } from "@dsign/library/commonjs/storage/Storage";
import { EventManager } from "@dsign/library/src/event";
import { AbstractSender } from "@dsign/library/src/sender";
import { IceHockeyMatchEntity } from "./entity/IceHockeyMatchEntity";

/**
 * @class IceHockeyScoreboardService
 */
 export class IceHockeyScoreboardService extends EventManagerAware {

    static get DATA()  { return 'data-scoreboard'; }

    /**
     * @return {string}
     */
    static get CHANGE_SCOREBOARD_MATCH() { return 'change-scoreboard-match'; }

    /**
     * @param {StorageInterface} storage
     * @param {AbstractSender} sender
     */
    constructor(storage, sender) {
        super();

        this.match = null;

        /**
         * @type EventManagerAwareInterface
         */
        this.sender = sender;

        /**
         * @type StorageInterface
         */
        this.storage = storage;
        
        /**
         * Events
         */
        this.storage.getEventManager().on(Storage.POST_UPDATE, this._updateListener.bind(this));
       
    }

    /**
     * @param {IceHockeyMatchEntity} match 
     * @returns 
     */
    setMatch(match) {
        this.match = match;
        this.getEventManager().emit(IceHockeyScoreboardService.CHANGE_SCOREBOARD_MATCH, this.match);
        return this;
    }

    /**
     * @returns {IceHockeyMatchEntity} 
     */
    getMatch() {
        return this.match;
    }

    /**
     * @param {IceHockeyMatchEntity} match 
     * @returns 
     */
    updateMatchScoreboard(match) {
        if(match.getId() !== this.match.getId() ) {
            throw 'Wrong match scoreboard';
        }

        return this.storage.update(match);
    }

    _updateListener(evt) {
        
        if (this.match === null || (this.match.id !== evt.data.id)) {
            return;
        }
       

        let message = {
            event : IceHockeyScoreboardService.DATA,
            data : {
                match : this.match
            }
        };

        this.sender.send('proxy', message);
    }

    /**
     * 
     * @returns 
     */
    getStorage() {
        return this.storage;
    }
 }