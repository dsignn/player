import { AbstractInjector } from "../../../timeslot/src/injector/AbstractInjector";
import { IceHockeyScoreboardService } from "../IceHockeyScoreboardService";

/**
 *
 */
 export class ScoreboardDataInjector extends AbstractInjector {

    /**
     * @param {IceHockeyScoreboardService} iceHockeyScoreboardService 
     */
    constructor(iceHockeyScoreboardService) {
        super();

        this.hasData = false;

        /**
         * @type {iceHockeyScoreboardService}
         */
        this.iceHockeyScoreboardService = iceHockeyScoreboardService;
    }


    /**
     * @param {string} value
     * @return Promise
     */
    getServiceData(value) {
        return new Promise((resolve) => {
            resolve([this.iceHockeyScoreboardService.getMatch()]);
        });
    }

      /**
     * @param {Object} data
     * @return Promise
     */
    getTimeslotData(data) {
        return new Promise((resolve, reject) => {

            resolve(this.iceHockeyScoreboardService.getMatch());
        });
    }

    /**
     * @param {Timer} timer
     */
    extractTimeslot(match) {
        return {'id' : match.id};
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        return 'Scoreboard data';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return ScoreboardDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Scoreboard metadata';
    }

    get serviceNamespace () {
        return 'scoreboard';
    }
 }