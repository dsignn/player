import { EntityIdentifier } from "@dsign/library/src/storage/entity/EntityIdentifier";
import { IceHockeyMatch } from "@dsign/library/src/sport/ice-hockey/match/IceHockeyMatch";

/**
* @class IceHockeyMatchEntity
*/
class IceHockeyMatchEntity extends EntityIdentifier { };

/**
 * Custom inheritance
 */
let functions = Object.getOwnPropertyNames(IceHockeyMatch.prototype);
functions.forEach(function (method) {
    IceHockeyMatchEntity.prototype[method] = IceHockeyMatch.prototype[method];
});

functions = Object.getOwnPropertyNames(IceHockeyMatch.prototype.__proto__);
functions.forEach(function (method) {
    if (method !== 'constructor') {
        IceHockeyMatchEntity.prototype[method] = IceHockeyMatch.prototype.__proto__[method];
    }  
});


export {IceHockeyMatchEntity};