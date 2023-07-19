/**
 * 
 * @class PlayerPropertyAwareMixin 
 */
export const PlayerPropertyAwareMixin = (superClass) => {

    return class extends superClass {

        /**
         * Constant to sunning resource
         */
        static get RUNNING() { return 'running'; }

        static get IDLE() { return 'idle'; }

        static get PAUSE() { return 'pause'; }

        constructor() {
            super();

            /**
             * @type {integer}
             */
            this.currentTime = 0;

            /**
             * @type {String}
             */
            this.status = this.constructor.IDLE;
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
         * @param {float} currentTime 
         * @returns 
         */
        setCurrentTime(currentTime) {
            this.currentTime = currentTime;
            return this;
        }

        getStatus() {
            return this.status;
        }

        /**
         *
         */
        reset() {
            this.currentTime = 0;
        }
    }
};
