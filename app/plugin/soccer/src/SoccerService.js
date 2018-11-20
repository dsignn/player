/**
 *
 */
class SoccerService {

    static get UPDATE_CURRENT_MATCH() { return 'update-current-match' };

    static get HOME_TEAM() { return 'home' };

    static get GUEST_TEAM() { return 'guest' };

    constructor(storage) {

        /**
         *
         * @type {MatchSoccer}|{}
         */
        this.match = new MatchSoccer();

        /**
         * @param {Storage}
         */
        this.storage = storage;

        this.storage.eventManager.on(Storage.STORAGE_POST_UPDATE, this._checkChangeEnableMatch.bind(this));
        this.storage.getAll({enable: 1}).then((enableMatchs) => {

            switch (enableMatchs.length) {
                case 2:
                    console.error('Must be present 0 or 1 enable match');
                    break;
                case 1:
                    this.match = enableMatchs[0];
                    this.match.guestTeam.sortPlayer({position : true});
                    this.match.homeTeam.sortPlayer({position : true});
                    break;
            }
        });

        this.eventManager = new EvtManager();
    }

    /**
     * @param evt
     * @private
     */
    _checkChangeEnableMatch(evt) {

       switch (true) {
           case this.match.id === evt.data.id && evt.data.enable === 0 :
               this.match = new MatchSoccer();
               this.eventManager.fire(SoccerService.UPDATE_CURRENT_MATCH, this.match);
               break;
           case evt.data.enable === 1 && evt.data.id !== this.match.id :
               this.match = evt.data;
               this.match.guestTeam.sortPlayer({position : true});
               this.match.homeTeam.sortPlayer({position : true});
               this.eventManager.fire(SoccerService.UPDATE_CURRENT_MATCH, this.match);
               break;
       }
    }

    /**
     * @returns {MatchSoccer}
     */
    getCurrentMatch() {
        return this.match;
    }

    /**
     *
     */
    updateCurrentMatch() {

        this.storage.update(this.match).then((data) => {

            this.eventManager.fire('update-match', data);
            console.log('SoccerService UPDATE', data);
        });
    }

    /**
     * @param teamName
     * @param card
     */
    addCard(teamName, card) {

        let result = this._getTeamFromString(teamName).addCard(card);
        if (result) {
            console.log('SoccerService ADD CARD', teamName, card);
            this.eventManager.fire(`add-card-${teamName}`, {card : result});
            this.updateCurrentMatch();
        }
    }

    /**
     * @param teamName
     * @param card
     */
    removeCard(teamName, card) {

        let result = this._getTeamFromString(teamName).removeCard(card);
        if (result) {
            console.log('SoccerService REMOVE CARD', teamName, card);
            this.eventManager.fire(`remove-card-${teamName}`, {card : result});
            this.updateCurrentMatch();
        }
    }

    /**
     * @param teamName
     */
    updateCards(teamName) {
        this._getTeamFromString(teamName).sortCardsPlayer({time : true});
        console.log('SoccerService UPDATE CARDS', teamName, this._getTeamFromString(teamName).cards);
        this.eventManager.fire(`update-cards-${teamName}`, {cards : this._getTeamFromString(teamName).cards});
        this.updateCurrentMatch();
    }

    /**
     * @param teamName
     * @param goal
     * @return {PlayerSoccer}
     */
    addGoal(teamName, goal) {

        let result = this.match.addGoal(teamName, goal);
        if (result) {
            if (Goal.TYPE_AUTO === goal.type) {
                teamName = teamName === 'home' ? 'guest' : 'home';
            }
            console.log('SoccerService ADD GOAL', teamName, goal);
            this.eventManager.fire(`add-goal-${teamName}`, {goal : result});
            this.updateCurrentMatch();
        }
    }

    /**
     * @param teamName
     * @param goal
     */
    removeGoal(teamName, goal) {

        let result = this.match.removeGoal(teamName, goal);
        if (result) {
            if (Goal.TYPE_AUTO === goal.type) {
                teamName = teamName === 'home' ? 'guest' : 'home';
            }
            console.log('SoccerService REMOVE GOAL', teamName, goal);
            this.eventManager.fire(`remove-goal-${teamName}`, {goal : result});
            this.updateCurrentMatch();
        }
    }

    /**
     * @param teamName
     */
    updateGoals(teamName) {
        this._getTeamFromString(teamName).sortGoalsPlayer({time : true});
        console.log('SoccerService UPDATE GOALS', teamName, this._getTeamFromString(teamName).goals);
        this.eventManager.fire(`update-goals-${teamName}`, {cards : this._getTeamFromString(teamName).goals});
        this.updateCurrentMatch();
    }

    /**
     * @param {string} teamName
     * @param {string} id
     */
    getPlayer(teamName, id) {
        return this._getTeamFromString(teamName).getPlayer(id);
    }

    /**
     * @param teamName
     * @return {TeamSoccer}
     */
    getTeam(teamName) {
        return this._getTeamFromString(teamName);
    }

    /**
     * @param teamName
     * @return {TeamSoccer}
     * @private
     */
    _getTeamFromString(teamName) {

        let team = {};
        switch (teamName) {
            case SoccerService.GUEST_TEAM:
                team = this.match.getGuestTeam();
                break;
            case SoccerService.HOME_TEAM:
                team = this.match.getHomeTeam();
                break;
            default:
                throw 'Wrong team name';
        }

        return team;
    }
}

module.exports = SoccerService;