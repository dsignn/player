import {EventManager} from "@dsign/library/src/event/index";

/**
 * @class AbstractTimeslotService
 */
export class AbstractTimeslotService {

    /**
     * Name of the "message" send from sender when play timeslot
     *
     * @return {string}
     */
    static get PLAY()  { return 'play-timeslot'; }

    /**
     * Name of the "message" send from sender when stop timeslot
     *
     * @return {string}
     */
    static get STOP()  { return 'stop-timeslot'; }

    /**
     * Name of the "message" send from sender when pause timeslot
     *
     * @return {string}
     */
    static get PAUSE()  { return 'pause-timeslot'; }

    /**
     * Name of the "message" send from sender when resume timeslot
     *
     * @return {string}
     */
    static get RESUME() { return 'resume-timeslot'; }

    /**
     * Name of the "message" send from sender when resume timeslot
     *
     * @return {string}
     */
    static get CHANGE_TIME() { return 'change-time-timeslot'; }

    /**
     * @param {Storage} timeslotStorage
     * @param {sender} sender
     * @param {Timer} timer
     * @param {TimeslotDataInjectorServicePluginManager} dataInjectorManager
     */
    constructor(timeslotStorage, sender, timer, dataInjectorManager) {

        /**
         *
         */
        this.sender = sender ? sender : null;

        /**
         * @type {Timer}
         */
        this.timer = timer;

        /**
         * @type {Storage}
         */
        this.timeslotStorage = timeslotStorage ? timeslotStorage : null;

        /**
         * @type {ContainerAggregate}
         */
        this.dataInjectorManager = dataInjectorManager;

        /**
         * Event manager
         */
        this.eventManager = new EventManager();

        /**
         * Check if timer is inject
         */
        if (!this.timer) {
            throw 'Timer not set';
        }
    }

    /**
     * @private
     */
    _schedule() {
        throw 'Must be implements';
    }

    /**
     *
     * @param {Object} obj
     * @return {boolean}
     */
    isRunning(obj) {
        throw 'Must be implements';
    }

    /**
     * @param {Object} obj
     */
    play(obj) {
        throw 'Must be implements';
    }

    /**
     * @param {Object} obj
     */
    stop(obj) {
        throw 'Must be implements'
    }

    /**
     * @param {Object} obj
     */
    pause(obj) {
        throw 'Must be implements'
    }

    /**
     * @param timeslot
     */
    resume(timeslot) {
        throw 'Must be implements'
    }

    /**
     * @param {Array} dataReferences
     * @return {Promise}
     * @private
     */
    _extractTimeslotDataFromDataReferences(dataReferences) {
        let promises = [];
        let property;
        let data;

        for (let cont = 0; dataReferences.length > cont;  cont++) {
            data = {};
            if (this.dataInjectorManager.has(dataReferences[cont].name)) {

                data[this.dataInjectorManager.get(dataReferences[cont].name).serviceNamespace] =
                    this.dataInjectorManager.get(dataReferences[cont].name).getTimeslotData(dataReferences[cont].data);

                promises.push(data);
            }
        }

        return Promise.all(promises);
    }

    /**
     *
     * @param timeslot
     * @return {Object|null}
     * @private
     */
    async _synchExtractTimeslotData(timeslot) {
        let data = null;
        if (timeslot.dataReferences.length === 0) {
            return data;
        }

        data = await this._extractTimeslotDataFromDataReferences(timeslot.dataReferences);

        return data;
    }

    /**
     * @param {Array} references
     */
    getTimeslotsFromArrayReference(references) {
        let timeslots = [];
        for (let cont = 0; references.length > cont; cont++) {
            timeslots.push(this.timeslotStorage.get(references[cont].id));
        }
        return Promise.all(timeslots);
    }

    /**
     * @return {EventManager}
     */
    getEventManager() {
        return this.eventManager
    }
}
