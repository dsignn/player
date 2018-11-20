class Match {

    constructor() {

        /**
         * @type {Team|Object}
         */
        this.homeTeam = {};

        /**
         * @type {Team|Object}
         */
        this.guestTeam = {};

        /**
         * @type {Date|null}
         */
        this.time = null;

        /**
         * @type {Date|null}
         */
        this.date = null;

        /**
         * @type {null}
         */
        this.place = null;
    }

    /**
     * @returns {boolean}
     */
    hasHomeTeam() {
        return Object.keys(this.homeTeam).length !== 0 && this.homeTeam.constructor !== Object;
    }

    /**
     * @returns {boolean}
     */
    hasGuestTeam() {
        return Object.keys(this.guestTeam).length !== 0 && this.guestTeam.constructor !== Object;
    }

    /**
     * @return {TeamSoccer}
     */
    getHomeTeam() {
        return this.homeTeam;
    }

    /**
     * @return {TeamSoccer}
     */
    getGuestTeam() {
        return this.guestTeam;
    }

    /**
     * @returns {Match}
     */
    removeHomeTeam() {
        this.homeTeam = {};
        return this;
    }

    /**
     * @returns {Match}
     */
    removeGuestTeam() {
        this.guestTeam = {};
        return this;
    }
}

module.exports = Match;