class Replacement {

    /**
     *
     * @param {string} playerIdIn
     * @param {string} playerIdOut
     * @param {number} time
     */
    constructor(playerIdIn, playerIdOut, time) {

        /**
         * @type {string}
         */
        this.playerIdIn = playerIdIn;

        /**
         * @type {string}
         */
        this.playerIdOut = playerIdOut;

        /**
         * @type {number}
         */
        this.time = time;
    }
}

module.exports = Replacement;