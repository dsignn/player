/**
 * @class {MonitorPropertyAwareMixin}  
 */
export const MonitorPropertyAwareMixin = (superClass) => {
    
    return class extends superClass {

        /**
         * Constant context to running resources
         */
        static get CONTEXT_DEFAULT() { return 'default'; }
    
        static get CONTEXT_STANDARD() { return 'standard'; }
    
        static get CONTEXT_OVERLAY() { return 'overlay'; }
        /**
         * Constant method to rotation the resource into monitor
         */
        static get ROTATION_NO() { return 'rotation-no'; }

        static get ROTATION_LOOP() { return 'rotation-loop'; }

        static get ROTATION_INFINITY() { return 'rotation-infinity'; }
         /**
         * Constant to adjust the size of the resource into the monitor
         */
        static get SIZE_NORMAL() { return 'size-normal'; }

        static get SIZE_CONTAIN() { return 'size-contain'; }


        constructor() {
            super();

            /**
             * @type {String}
             */
            this.context = this.constructor.CONTEXT_STANDARD;

            /**
             * @type {String}
             */
            this.adjust = this.constructor.SIZE_CONTAIN;

            /**
             * @type {string}
             */
            this.rotation = this.constructor.ROTATION_NO;
        }

        /**
         * @returns {string}
         */
        getContext() {
            return this.context;
        }

        /**
         * @param {string} context 
         * @returns {MonitorPropertyAwareMixin}
         */
        setContext(context) {
            this.context = context;
            return this;
        }

        /**
         * @returns {string}
         */
        getRotation() {
            return this.rotation;
        }

        /**
         * @param {string} rotation 
         * @returns {MonitorPropertyAwareMixin}
         */
        setRotation(rotation) {
            this.rotation = rotation;
            return this;
        }

        /**
         * @returns {string}
         */
        getAdjust() {
            return this.adjust;
        }

        /**
         * @param {string} adjust 
         * @returns {MonitorPropertyAwareMixin}
         */
        setAdjust(adjust) {
            this.adjust = adjust;
            return this;
        }
    }
}