const IceHockeyScoreboardService = (async () => {

    const { Storage } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/Storage.js`));
    const { EventManagerAware } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/event/EventManagerAware.js`));
    const { AbstractSender } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/sender/AbstractSender.js`));

    /**
     * @class IceHockeyScoreboardService
     */
    class IceHockeyScoreboardService extends EventManagerAware {

        static get DATA() { return 'data-ice-hockey-scoreboard'; }

        /**
         * @return {string}
         */
        static get CHANGE_SCOREBOARD_MATCH() { return 'change-ice-hockey-scoreboard-match'; }

        /**
         * @return {string}
         */
         static get CLEAR_SCOREBOARD_MATCH() { return 'clear-ice-hockey-scoreboard-match'; }

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
         * @returns {IceHockeyMatchEntity} 
         */
        clearMatch() {
            this.match = null;
            this.getEventManager().emit(IceHockeyScoreboardService.CLEAR_SCOREBOARD_MATCH);
            return this;
        }

        /**
         * @param {IceHockeyMatchEntity} match 
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
            this.setMatch(evt.data);

            //this
            let message = {
                event: IceHockeyScoreboardService.DATA,
                data: {
                    match: this.match
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

    return {IceHockeyScoreboardService: IceHockeyScoreboardService};

})();

export default IceHockeyScoreboardService;
export const then = IceHockeyScoreboardService.then.bind(IceHockeyScoreboardService);










