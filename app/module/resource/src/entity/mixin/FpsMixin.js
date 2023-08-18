/**
 * 
 * @class FpsMixin 
 */
export const FpsMixin = (superClass) => {
    
    return class extends superClass {

        constructor() {
            super();
        
            this.fps = null;
        }

        /**
         * @returns {string}
         */
        getFps() {
            return this.fps;
        }

        /**
         * @param {string} fps 
         */
        setFps(fps) {
            this.fps = fps;
            return this;
        }
    }   
};
