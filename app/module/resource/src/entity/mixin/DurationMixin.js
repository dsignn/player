/**
 * 
 * @class DurationMixin 
 */
export const DurationMixin = (superClass) => {
    
    return class extends superClass {

        constructor() {
            super();
        
            this.duration = 0;
        }

        /**
         * @returns {Number}
         */
        getDuration() {
            return this.duration;
        }

        /**
         * 
         * @param {Number} duration 
         */
        setDuration(duration) {
            this.duration = duration;
        }
    }
       
};
