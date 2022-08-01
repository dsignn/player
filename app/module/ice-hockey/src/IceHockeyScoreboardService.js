import { EventManagerAware } from "@dsign/library/commonjs/event/EventManagerAware";
import { Storage } from "@dsign/library/commonjs/storage/Storage";
import { EventManager } from "@dsign/library/src/event";
import { IceHockeyMatchEntity } from "./entity/IceHockeyMatchEntity";

/**
 * @class IceHockeyScoreboardService
 */
 export class IceHockeyScoreboardService extends EventManagerAware {

    /**
     * @return {string}
     */
    static get CHANGE_SCOREBOARD_MATCH() { return 'change-scoreboard-match'; }

    /**
     * @param {StorageInterface} storage 
     */
    constructor(storage) {

        super();

        this.storage = storage;

        this.match = null;

        /**
         * Events
         */
        this.storage.getEventManager().on(Storage.POST_UPDATE, this._updateListener);
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
        
        console.log('UPDATE', evt);
    }
 }