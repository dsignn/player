
class Card {

    static get TYPE_RED() { return 'red' };

    static get TYPE_YELLOW() { return 'yellow' };

    /**
     * @param type
     * @param time
     * @param playerId
     */
    constructor(type = null, time = null, playerId = null) {

        /**
         * @type string
         */
        this.type = type ? type : Card.TYPE_YELLOW;

        /**
         * @type string
         */
        this.time = time;

        /**
         * @type string
         */
        this.playerId = playerId;
    }
}

module.exports = Card;