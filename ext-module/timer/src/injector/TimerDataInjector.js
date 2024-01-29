import {AbstractInjector} from "./../../../timeslot/src/injector/AbstractInjector"

/**
 *
 */
export class TimerDataInjector extends AbstractInjector {

    constructor(timerStorage, timerService) {
        super();

        /**
         * @type {Storage}
         */
        this.storage = timerStorage;

        /**
         * @type {TimerService}
         */
        this.timerService = timerService;
    }

    /**
     * @param {string} value
     * @return Promise
     */
    getServiceData(value) {
        return this.storage.getAll({name: value});
    }

    /**
     * @param {Object} data
     * @return Promise
     */
    getData(data) {
        return new Promise((resolve, reject) => {

            if (this.timerService && this.timerService.hasRunningTimer(data.id)) {
                resolve(this.timerService.getRunningTimer(data.id));
            }

            this.storage.get(data.id).then(function(data) {

                let obj = {};
                obj[this.serviceNamespace] = data;
                resolve(obj);
            }.bind(this)).catch((err) => {
                reject(err);
            })
        });
    }

    /**
     * @param {Timer} timer
     */
    extractTimeslot(timer) {
        return {'id' : timer.id};
    }

    /**
     *  @return string
     */
    get serviceLabel() {
        return 'Timer Data';
    }

    /**
     *  @return string
     */
    get serviceName() {
        return TimerDataInjector.name;
    }

    /**
     *  @return string
     */
    get serviceDescription() {
        return 'Timer metadata';
    }

    get serviceNamespace () {
        return 'timer';
    }
}