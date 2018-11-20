try {
    Team = require('./../../../../lib/sport/model/Team');

}
catch(err) {
    Team = require(__dirname + '/lib/sport/model/Team');

}

class TeamSoccer extends Team {

    static get NUMBER_HOLDER() { return 11; };

    constructor() {
        super();

        /**
         * @type {Array}
         */
        this.replacemens = [];

        /**
         *
         * @type {Array}
         */
        this.cards = [];

        /**
         *
         * @type {Array}
         */
        this.goals = [];
    }



    /**
     * @param playerId
     * @param status
     * @return {PlayerSoccer}|null
     */
    setStatusPlayer(playerId, status) {

        let player = null;
        let searchPlayer = this.players.find((ele) => {
            return ele.id === playerId;
        });

        if (!searchPlayer) {
            return player;
        }


        if (status === PlayerSoccer.STATUS_HOLDER) {
            if(this.countPlayer({status:PlayerSoccer.STATUS_HOLDER}) < TeamSoccer.NUMBER_HOLDER) {

                if (searchPlayer) {
                    player = searchPlayer;
                    player.status = status;
                }
            }
        } else {
            player = searchPlayer;
            player.status = status;
        }

        return player;
    }

    /**
     * @return {number}
     */
    countPlayer(options) {
        let count = 0;
        for (let cont = 0; this.players.length > cont; cont++) {
            switch (true) {
                case typeof options === 'object' && options.status === PlayerSoccer.STATUS_HOLDER && this.players[cont].status === PlayerSoccer.STATUS_HOLDER :
                    count++;
                    break;
                    // TODO other count
                case typeof options === 'undefined':
                    count++;
            }
        }

        return count;
    }

    /**
     * @param {string} id
     * @return {PlayerSoccer}|null
     */
    getPlayer(id) {
        let player =  this.players.find((player) => {
            return player.id === id;
        });

        return player ? player : null;
    }

    /**
     * @param {Object} options
     * @return {Array}
     */
    getPlayers(options) {

        let players = super.getPlayers();

        if (options && (options.bench === true || options.toBench === true)) {
            players =  players.filter((player) => { return player.status === PlayerSoccer.STATUS_BENCH; });

            if (options.toBench === true) {
                players =  players.filter((player) => {
                    let toBench = true;
                    for (let cont = 0; this.replacemens.length > cont; cont++) {
                        if (player.id === this.replacemens[cont].playerOut.id) {
                            toBench = false;
                            break;
                        }
                    }
                    return toBench;
                });
            }
        }

        if (options && options.surname !== '') {
            players =  players.filter((player) => { return player.surname.search(new RegExp(options.surname, 'i')) > -1; });
        }

        if (options && options.name !== '') {
            players =  players.filter((player) => { return player.name.search(new RegExp(options.name, 'i')) > -1; });
        }

        return players;
    }

    /**
     * @param options
     */
    sortPlayer(options) {
        if(options && options.position === true) {
            this.players.sort((elem1, elem2) =>{

                let value = 1;
                switch (elem1.position) {
                    case PlayerSoccer.POSITION_GAOLKEEPER:
                        value = -1;
                        break;
                    case PlayerSoccer.POSITION_DEFENDER:
                        switch (elem2.position) {
                            case PlayerSoccer.POSITION_DEFENDER:
                                value =  0;
                                break;
                            case PlayerSoccer.POSITION_GAOLKEEPER:
                                value = 1;
                                break;
                            case PlayerSoccer.POSITION_MIDFIELDER:
                            case PlayerSoccer.POSITION_STRIKER:
                                value = -1;
                                break;
                        }

                        break;
                    case PlayerSoccer.POSITION_MIDFIELDER:

                        switch (elem2.position) {
                            case PlayerSoccer.POSITION_MIDFIELDER:
                                value =  0;
                                break;
                            case PlayerSoccer.POSITION_DEFENDER:
                            case PlayerSoccer.POSITION_GAOLKEEPER:
                                value = 1;
                                break;
                            case PlayerSoccer.POSITION_STRIKER:
                                value = -1;
                                break;
                        }

                        break;
                    case PlayerSoccer.POSITION_STRIKER:
                        value = 1;
                }

                return value;
            });
        }
    }

    /**
     * @param {PlayerSoccer} playerIn
     * @param {PlayerSoccer} playerOut
     * @param {number}  time
     * @return {Replacement}|null
     */
    addReplacementPlayer(playerIn, playerOut, time) {
        let replacement = null;
        let searchPlayerIn = this.players.find((player) => {
            return player.id === playerIn.id;
        });

        if (!searchPlayerIn || searchPlayerIn.status !== PlayerSoccer.STATUS_BENCH) {
            return replacement;
        }

        let searchPlayerOut = this.players.find((player) => {
            return player.id === playerOut.id;
        });

        if (!searchPlayerOut || searchPlayerOut.status !== PlayerSoccer.STATUS_HOLDER) {
            return replacement;
        }

        replacement = new Replacement(
            playerIn,
            playerOut,
            time
        );

        this.replacemens.push(replacement);
        this.sortReplacementPlayer({time : true});

        searchPlayerIn.status = PlayerSoccer.STATUS_HOLDER;
        searchPlayerOut.status = PlayerSoccer.STATUS_BENCH;

        return replacement;
    }

    /**
     * @param {Replacement} replacement
     * @return {boolean}
     */
    removeReplacementPlayer(replacement) {

        let index = this.replacemens.findIndex((iReplacement) => {
            return iReplacement.playerIn.id === replacement.playerIn.id &&
                iReplacement.playerOut.id === replacement.playerOut.id &&
                iReplacement.time === replacement.time
        });

        if (index > -1) {
            this.replacemens.splice(index, 1);
        }

        return index > -1;
    }

    /**
     * @param options
     */
    sortReplacementPlayer(options) {

        if (options && options.time === true) {
            this.replacemens.sort((elem1, elem2) => {
                return elem1.time <= elem2.time;
            });
        }
    }

    /**
     * @param options
     */
    sortCardsPlayer(options) {

        if (options && options.time === true) {
            this.cards.sort((elem1, elem2) => {
                return elem1.time <= elem2.time;
            });
        }
    }

    /**
     * @param options
     */
    sortGoalsPlayer(options) {

        if (options && options.time === true) {
            this.goals.sort((elem1, elem2) => {
                return elem1.time <= elem2.time;
            });
        }
    }

    /**
     * @param {Card} card
     * @return {Card}|null
     */
    addCard(card) {

        if (this.isExpelled({id : card.playerId}) || !this._hasPlayer(card.playerId)) {
            return null;
        }

        this.cards.push(card);
        this.sortCardsPlayer({time : true});
        return card;
    }

    /**
     * @param card
     * @return {Card}|null
     */
    removeCard(card) {
        let toRemove = null;

        let index = this.cards.findIndex((iCard) => {
            return card.type === iCard.type && card.time === iCard.time && card.playerId === iCard.playerId;
        });

        if (index > -1) {
            toRemove = this.cards.splice(index, 1)[0];
        }
        return toRemove;
    }

    /**
     * @param {PlayerSoccer} player
     * @return {boolean}
     */
    isExpelled(player) {

        let playerCards = this.cards.filter((card) => {
            return card.playerId === player.id;
        });

        let yellowCount = 0;
        for (let cont = 0; playerCards.length > cont; cont++) {
            if (playerCards[cont].type === Card.TYPE_YELLOW) {
                yellowCount++;
            }
        }

        let red = !!playerCards.find((elem) => {
            return elem.type === Card.TYPE_RED;
        });

        return red || yellowCount >= 2;
    }

    /**
     * @param {PlayerSoccer} player
     * @returns {boolean}
     */
    isWarning(player) {

        let playerCards = this.cards.filter((card) => {
            return card.playerId === player.id;
        });

        let yellowCount = 0;
        for (let cont = 0; playerCards.length > cont; cont++) {
            if (playerCards[cont].type === Card.TYPE_YELLOW) {
                yellowCount++;
            }
        }
        return yellowCount === 1;
    }

    /**
     * @param {PlayerSoccer} player
     * @returns {boolean}
     */
    hasNoCard(player) {
        let playerCards = this.cards.filter((card) => {
            return card.playerId === player.id;
        });

        return playerCards.length === 0;
    }

    /**
     * @return {Number}
     */
    getResult() {
        return this.goals.length;
    }

    /**
     * @param playerId
     * @return {boolean}
     * @private
     */
    _hasPlayer(playerId) {
        let index = this.players.findIndex((player) => {
            return player.id === playerId;
        });

        return index > -1;
    }
}

module.exports = TeamSoccer;