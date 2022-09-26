import { EntityIdentifier } from "@dsign/library/src/storage/entity/EntityIdentifier";
import { GenericPlayer } from "@dsign/library/src/sport/player/GenericPlayer";

/**
* @class IceHockeyPlayerEntity
*/
class IceHockeyPlayerEntity extends EntityIdentifier { };

/**
 * Custom inheritance
 */
let functions = Object.getOwnPropertyNames(GenericPlayer.prototype);
functions.forEach(function (method) {
    IceHockeyPlayerEntity.prototype[method] = GenericPlayer.prototype[method];
});

export {IceHockeyPlayerEntity};