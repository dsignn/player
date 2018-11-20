try {
    Match = require('./../../../../lib/sport/model/Match');

}
catch(err) {
    Match = require(__dirname + '/lib/sport/model/Match');

}

class MatchSoccer extends Match {

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
     * @return {Goal}|null
     */
    addGoal(teamName, goal) {

        let team = teamName === 'home' ? this.getHomeTeam() : this.getGuestTeam();
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
        let team = teamName === 'home' ? this.getHomeTeam() : this.getGuestTeam();
        let index = team.goals.findIndex((iGoal) => {
            return goal.type === iGoal.type && goal.playerId === iGoal.playerId;
        });

        if (index > -1) {
            toRemove = team.goals.splice(index, 1)[0];
        }
        return toRemove;
    }
}

module.exports = MatchSoccer;