class Replacement {

    /**
     *
     * @param {PlayerSoccer} playerIn
     * @param {PlayerSoccer} playerOut
     * @param {number} time
     */
    constructor(playerIn = new PlayerSoccer(), playerOut = new PlayerSoccer(), time) {

        /**
         * @type {PlayerSoccer}
         */
        this.playerIn = playerIn;

        /**
         * @type {PlayerSoccer}
         */
        this.playerOut = playerOut;

        /**
         * @type {number}
         */
        this.time = time;
    }
}

module.exports = Replacement;