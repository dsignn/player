const SoccerScoreboardService = (async () => {

    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));
    const { EventManagerAware } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/event/EventManagerAware.js`));
    const { AbstractSender } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sender/AbstractSender.js`));

    /**
     * @class SoccerScoreboardService
     */
    class SoccerScoreboardService extends EventManagerAware {

        static get DATA() { return 'data-soccer-scoreboard'; }

        /**
         * @return {string}
         */
        static get CHANGE_SCOREBOARD_MATCH() { return 'change-soccer-scoreboard-match'; }

        /**
         * @return {string}
         */
         static get CLEAR_SCOREBOARD_MATCH() { return 'clear-soccer-scoreboard-match'; }

        /**
         * @param {StorageInterface} storage
         * @param {AbstractSender} sender
         */
        constructor(storage) {
            super();

            this.match = null;

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
         * @param {SoccerMatchEntity} match 
         * @returns 
         */
        setMatch(match) {
            this.match = match;
            this.getEventManager().emit(SoccerScoreboardService.CHANGE_SCOREBOARD_MATCH, this.match);
            return this;
        }

        /**
         * @returns {SoccerMatchEntity} 
         */
        getMatch() {
            return this.match;
        }

        /**
         * @returns {SoccerMatchEntity} 
         */
        clearMatch() {
            this.match = null;
            this.getEventManager().emit(SoccerScoreboardService.CLEAR_SCOREBOARD_MATCH);
            return this;
        }

        /**
         * @param {SoccerMatchEntity} match 
         * @returns 
         */
        updateMatchScoreboard(match) {
            if (match.getId() !== this.match.getId()) {
                throw 'Wrong match scoreboard';
            }

            return this.storage.update(match);
        }

        _updateListener(evt) {

            if (this.match === null || (this.match.id !== evt.data.id)) {
                return;
            }

            evt.data.time = this.match.time;
            this.match = evt.data;
            this.getEventManager().emit(SoccerScoreboardService.DATA, this.match);
        }

        /**
         * 
         * @returns 
         */
        getStorage() {
            return this.storage;
        }
    }

    return {SoccerScoreboardService: SoccerScoreboardService};

})();

export default SoccerScoreboardService;
export const then = SoccerScoreboardService.then.bind(SoccerScoreboardService);










