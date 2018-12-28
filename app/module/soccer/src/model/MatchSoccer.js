class MatchSoccer extends require('dsign-library').sport.model.Match {

    /**
     * @costant
     */
    static get HOME_TEAM() { return 'home' };

    /**
     * @costant
     */
    static get GUEST_TEAM() { return 'guest' };

    constructor() {
        super();

        /**
         * @type {TeamSoccer}
         */
        this.homeTeam = new TeamSoccer();

        /**
         * @type {TeamSoccer}
         */
        this.guestTeam = new TeamSoccer();

        /**
         * @type {number}
         */
        this.enable = 0;
    }

    /**
     * @param teamName
     * @param goal
     * @return {Goal|null}
     */
    addGoal(teamName, goal) {

        let team = this._getTeamFromString(teamName);
        let player = team.getPlayer(goal.playerId);
        if (player.status !== PlayerSoccer.STATUS_HOLDER) {
            return null;
        }

        if (Goal.TYPE_AUTO === goal.type) {
            team = teamName === 'home' ?  this.getGuestTeam() :  this.getHomeTeam();
        }

        team.goals.push(goal);
        team.sortGoalsPlayer({time : true});
        return goal;
    }

    /**
     * @param teamName
     * @param goal
     * @return {Goal}
     */
    removeGoal(teamName, goal) {

        let toRemove = null;
        let team = this._getTeamFromString(teamName);
        let index = team.goals.findIndex((iGoal) => {
            return goal.type === iGoal.type && goal.playerId === iGoal.playerId;
        });

        if (index > -1) {
            toRemove = team.goals.splice(index, 1)[0];
        }
        return toRemove;
    }

    /**
     * @param teamName
     * @return {Goal|null}
     */
    getLastGoal(teamName) {
        let team = this._getTeamFromString(teamName);
        team.sortGoalsPlayer({time : true});
        let goal = null;
        if (team.goals.length > 0) {
            goal = team.goals[0];
        }
        return goal;
    }

    /**
     *
     * @param teamName
     * @param goal
     * @return {SoccerPlayer|null}
     */
    getPlayerFromGoal(teamName, goal) {
        if (!goal) {
            return null;
        }

        let opposite = false;
        if (goal.type === Goal.TYPE_AUTO) {
            opposite = true;
        }
        return this._getTeamFromString(teamName, opposite).getPlayer(goal.playerId);
    }

    /**
     * @param teamName
     * @param opposite
     * @return {TeamSoccer}
     * @private
     */
    _getTeamFromString(teamName, opposite = false) {

        let team = {};
        switch (teamName) {
            case MatchSoccer.GUEST_TEAM:
                team = opposite === true ? this.getHomeTeam() : this.getGuestTeam();
                break;
            case MatchSoccer.HOME_TEAM:
                team = opposite === true ?  this.getGuestTeam() : this.getHomeTeam();
                break;
            default:
                throw 'Wrong team name';
        }
        return team;
    }
}

module.exports = MatchSoccer;