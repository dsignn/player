import { EntityIdentifier } from "@dsign/library/src/storage/entity/EntityIdentifier";
import { IceHockeyMatch } from "@dsign/library/src/sport/ice-hockey/match/IceHockeyMatch";
import { GenericPeriod } from "@dsign/library/src/sport/match/GenericPeriod";
import { GenericTeam } from "@dsign/library/src/sport/team/GenericTeam";

/**
* @class IceHockeyMatchEntity
*/
class IceHockeyMatchEntity extends EntityIdentifier {
    constructor() {
        super();
        this.periods = [
            new GenericPeriod('first'),
            new GenericPeriod('second'),
            new GenericPeriod('third')
        ];

        this.currentPeriod = new GenericPeriod('first');

        /**
         * @var TeamInteface
         */
        this.homeTeam = new GenericTeam();
        /**
         * @var Array<ScoreInterface>
         */
        this.homeScores = [];
        /**
         * @var TeamInteface
         */
        this.guestTeam = new GenericTeam();
        /**
         * @var Array<ScoreInterface>
         */
        this.guestScores = [];
    }
 };

/**
 * Custom inheritance
 */
let functions = Object.getOwnPropertyNames(IceHockeyMatch.prototype);
functions.forEach(function (method) {
    if (method !== 'constructor') {
        IceHockeyMatchEntity.prototype[method] = IceHockeyMatch.prototype[method];
    } 
});

functions = Object.getOwnPropertyNames(IceHockeyMatch.prototype.__proto__);
functions.forEach(function (method) {
    if (method !== 'constructor') {
        IceHockeyMatchEntity.prototype[method] = IceHockeyMatch.prototype.__proto__[method];
    }
});

export {IceHockeyMatchEntity};