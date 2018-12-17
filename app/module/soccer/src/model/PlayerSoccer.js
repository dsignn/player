try {
    Player = require('./../../../../lib/sport/model/Player');

}
catch (err) {
    Player = require(__dirname + '/lib/sport/model/Player');

}

class PlayerSoccer extends Player {

    static get POSITION_GAOLKEEPER() {
        return 'portiere';
    };

    static get POSITION_DEFENDER() {
        return 'difensore';
    };

    static get POSITION_MIDFIELDER() {
        return 'centrocampista';
    };

    static get POSITION_STRIKER() {
        return 'attaccante';
    };

    static get STATUS_ROSTRUM() {
        return 'rostrum';
    };

    static get STATUS_BENCH() {
        return 'bench';
    };

    static get STATUS_HOLDER() {
        return 'holder';
    };

    constructor() {
        super();

        /**
         * @type {null|String}
         */
        this.shirtName = null;

        /**
         * @type {null|Number}
         */
        this.shirtNumber = null;

        /**
         * @type {null|string}
         */
        this.position = null;

        /**
         * @type {Array}
         */
        this.goals = [];

        /**
         * @type {String}
         */
        this.status = PlayerSoccer.STATUS_ROSTRUM;

    }
}

module.exports = PlayerSoccer;