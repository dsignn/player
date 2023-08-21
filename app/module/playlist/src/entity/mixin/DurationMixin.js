/**
 * 
 * @class DurationMixin 
 */
export const DurationMixin = (superClass) => {

    return class extends superClass {

        constructor() {
            super();

            this.resources = [];
        }

        /**
        * @return {Number}
        */
        getDuration() {

            let duration = 0;
            for (let cont = 0; this.resources.length > cont; cont++) {
                duration = duration + parseFloat(this.resources[cont].duration);
            }
            return duration;
        }
    }
}