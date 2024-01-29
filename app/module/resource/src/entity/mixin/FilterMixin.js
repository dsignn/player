/**
 * 
 * @class FilterMixin 
 */
export const FilterMixin = (superClass) => {

    return class extends superClass {

        constructor() {
            super();

            this.filters = {};
        }

        /**
         * @returns {string}
         */
        getBlur() {
            return this.filters.blur;
        }

        /**
         * @returns {string}
         */
        setBlur(blur) {
            this.filters.blur = blur;
            return this;
        }

        /**
         * @returns {string}
         */
        getBrightness() {
            return this.filters.brightness;
        }

        /**
         * @returns {string}
         */
        setBrightness(brightness) {
            this.filters.brightness = brightness;
            return this;
        }

        /**
         * @returns {string}
         */
        getContrast() {
            return this.filters.brightness;
        }

        /**
         * @returns {string}
         */
        setContrast(contrast) {
            this.filters.contrast = contrast;
            return this;
        }

        /**
         * @returns {string}
         */
        getGrayscale() {
            return this.filters.grayscale;
        }

        /**
         * @returns {string}
         */
        setGrayscale(grayscale) {
            this.filters.grayscale = grayscale;
            return this;
        }

        /**
         * @returns {string}
         */
         getInvert() {
            return this.filters.invert;
        }

        /**
         * @returns {string}
         */
        setInvert(invert) {
            this.filters.invert = invert;
            return this;
        }

        /**
         * @returns {string}
         */
         getOpacity() {
            return this.filters.opacity;
        }

        /**
         * @returns {string}
         */
        setOpacity(opacity) {
            this.filters.opacity = opacity;
            return this;
        }

        /**
         * @returns {string}
         */
         getSaturate() {
            return this.filters.saturate;
        }

        /**
         * @returns {string}
         */
        setSaturate(saturate) {
            this.filters.saturate = saturate;
            return this;
        }

        /**
         * @returns {string}
         */
         getSepia() {
            return this.filters.sepia;
        }

        /**
         * @returns {string}
         */
        setSepia(sepia) {
            this.filters.sepia = sepia;
            return this;
        }

        /**
         * @returns {string}
         */
         getDropShadow() {
            return this.filters.dropShadow;
        }

        /**
         * @returns {string}
         */
        setDropShadow(dropShadow) {
            this.filters.dropShadow = dropShadow;
            return this;
        }
    }
};
