/**
 *
 */
class AbstractTimeslotService {

    static get PLAY()  { return 'play-timeslot'; }

    static get STOP()  { return 'stop-timeslot'; }

    static get PAUSE()  { return 'pause-timeslot'; }

    static get RESUME() { return 'resume-timeslot'; }

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
         * @type {TimeslotDataInjectorServicePluginManager}
         */
        this.dataInjectorManager = dataInjectorManager ? dataInjectorManager : new TimeslotDataInjectorServicePluginManager();

        /**
         * Event manager
         */
        this.eventManager = new (require('dsign-library').event.EvtManager)();

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

        for (let cont = 0; dataReferences.length > cont;  cont++) {
            if (this.dataInjectorManager.has(dataReferences[0].name)) {
                promises.push(this.dataInjectorManager
                    .get(dataReferences[0].name)
                    .getTimeslotData(dataReferences[cont].data)
                );
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
            timeslots.push(this.timeslotStorage.get(references[cont].referenceId));
        }
        return Promise.all(timeslots);
    }
}

module.exports = AbstractTimeslotService;