/**
 * 
 * @class DurationMixin 
 */
export const DurationMixin = (superClass) => {

    return class extends superClass {

        constructor() {
            super();

            this.duration = -1;

            /**
             * @type {Boolean}
             */
            this.disableAudio = false;
        }

        /**
         * @returns {Number}
         */
        getDuration() {
            return  Math.round(this.duration * 10) / 10;
        }

        /**
         * 
         * @param {Number} duration 
         */
        setDuration(duration) {
            this.duration = duration;
            return this;
        }
    }

};
