class Goal {

    static get TYPE_AUTO() { return 'autogoal' };

    static get TYPE_STANDARD() { return 'standard' };

    constructor(type = null, time = null, playerId = null) {

        /**
         * @type {string}
         */
        this.type = type ? type : Goal.TYPE_STANDARD;

        /**
         * @type {Number}
         */
        this.time = time;

        /**
         * @type string
         */
        this.playerId = playerId;
    }
}

module.exports = Goal;