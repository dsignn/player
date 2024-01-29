/**
 * 
 * @class DimensionMixin 
 */
export const DimensionMixin = (superClass) => {
    
    return class extends superClass {

        constructor() {
            super();
        
            this.dimension = {};
        }

        /**
         * @returns {Number}
         */
        getWidth() {
            return this.dimension.width;
        }

        /**
         * @param {Number} width 
         */
        setWidth(width) {
            this.dimension.width = width;
            return this;
        }

        /**
         * @returns {Number}
         */
        getHeight() {
            return this.dimension.height;
        }

        /**
         * @param {Number} duration 
         */
        setHeight(height) {
            this.dimension.height = height;
            return this;
        }
    }   
};
