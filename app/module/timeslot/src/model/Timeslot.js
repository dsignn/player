/**
 *
 */
class Timeslot {

    /**
     * Constant
     */
    static get RUNNING() { return 'running'; }
    static get IDLE() { return 'idle'; }
    static get PAUSE() { return 'pause'; }

    /**
     * The context property mean that a content must be running how background (default the lowest layer),
     * standard (the middle layer) or overlay (the highest layer)
     */
    static get CONTEXT_DEFAULT() { return 'default'; }
    static get CONTEXT_STANDARD() { return 'standard'; }
    static get CONTEXT_OVERLAY() { return 'overlay'; }

    static get ROTATION_NO() { return 'rotation-no'; }
    static get ROTATION_LOOP() { return 'rotation-loop'; }
    static get ROTATION_INFINITY() { return 'rotation-infinity'; }


    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {String}
         */
        this.status = Timeslot.IDLE;

        /**
         * @type {String}
         */
        this.context = Timeslot.CONTEXT_STANDARD;

        /**
         * @type {null|integer}
         */
        this.duration = null;

        /**
         * @type {string}
         */
        this.rotation = Timeslot.ROTATION_NO;

        /**
         * @type {integer}
         */
        this.currentTime = 0;

        /**
         * @type {Boolean}
         */
        this.disableAudio = false;

        /**
         * @type {Array}
         */
        this.binds = [];

        /**
         *
         * @type {null|Object}
         */
        this.virtualMonitorReference = null;

        /**
         * @type {Array}
         */
        this.resources = [];

        /**
         *
         * @type {{}}
         */
        this.options = {};

        /**
         * @type {Array}
         */
        this.dataReferences = [];

        /**
         * @type {Array}
         */
        this.tags = [];

        /**
         * @type {Object}
         */
        this.filters = {};
    }

    /**
     *
     */
    hasResourceType() {
        this.resources.find((resource) => {
            return resource.type.indexOf(type) > -1;
        });
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getOption(name) {
        let option = null;
        if (this.options && typeof this.options === 'object' && this.options[name]) {
            option = this.options[name];
        }
        return option;
    }

    /**
     * @param timeslot
     * @return {number}
     */
    removeBind(timeslot) {

        let index = this.binds.findIndex(
            (element) => {
                return element.id === timeslot.id;
            }
        );

        if (index > -1) {
            this.binds.splice(index, 1);
        }
    }

    /**
     * @param resource
     * @return {number}
     */
    removeResource(resource) {

        let index = this.resources.findIndex(
            (element) => {
                return element.id === resource.id;
            }
        );

        if (index > -1) {
            this.resources.splice(index, 1);
        }
    }

    /**
     * @return {string}
     */
    getCurrentTimeString() {
        let currentTime = this.currentTime+'';
        switch (true) {
            case this.getCurrentTime() % 1 === 0:
                currentTime = this.getCurrentTime() + '.0';
                break;
        }
        return currentTime;
    }

    /**
     * @return {number}
     */
    getDuration() {
        return parseInt(this.duration);
    }

    /**
     * @return {number}
     */
    getCurrentTime() {
        return parseFloat(this.currentTime);
    }

    /**
     *
     */
    reset() {
        this.currentTime = 0;
    }
}

module.exports = Timeslot;