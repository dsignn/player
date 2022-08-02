import { EntityReference } from "@dsign/library/commonjs/storage/entity/EntityReference";
import { GenericPeriod } from "@dsign/library/src/sport/match/GenericPeriod";
import { AbstractScore } from "@dsign/library/src/sport/score/AbstractScore";

/**
* @class IceHockeyScore
*/
class IceHockeyScore extends AbstractScore {
    constructor() {
        super();
  
        this.period = new GenericPeriod();

        this.time = null;

        this.playerReference = new EntityReference();
    }
};

export {IceHockeyScore};