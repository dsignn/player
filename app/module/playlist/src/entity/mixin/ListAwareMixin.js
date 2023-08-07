/**
 * 
 * @class ListAwareMixin 
 */
export const ListAwareMixin = (superClass) => {

    return class extends superClass {

        constructor() {
            super();

            this.resources = [];
        }

        /**
         * @return {null|ResourceEntity}
         */
        current() {
            let resource = null;
            if (this.currentIndex < this.resources.length) {
                resource = this.resources[this.currentIndex];
            }
            return resource;
        }

        /**
         * @return {null|ResourceEntity}
         */
        first() {
            let resource = null;
            if (this.resources.length > 0) {
                resource = this.resources[0];
            }
            return resource;
        }


        /**
         * @return {null|ResourceEntity}
         */
        next() {
            let resource = null;
            if ((this.currentIndex + 1) < this.resources.length) {
                this.currentIndex++;
                this.resources[this.currentIndex - 1].currentTime = 0;
                resource = this.resources[this.currentIndex];
            }
            return resource;
        }

        /**
         * @return {Boolean}
         */
        hasNext() {
            return (this.currentIndex + 1) < this.resources.length;
        }

        /**
         * @return {null|ResourceEntity}
         */
        previous() {
            let resource = null;
            if (this.currentIndex > 0 && (this.currentIndex - 1) < this.resources.length) {
                this.currentIndex--;
                resource = this.resources[this.currentIndex];
            }
            return resource;
        }

        /**
         * @return {ListAwareMixin}
         */
        reset() {
            this.currentIndex = 0;
            for (let cont = 0; this.resources.length > cont; cont++) {
                this.resources[cont].currentTime = 0;
            }
            return this;
        }

        /**
         * @return {Number}
         */
        count() {
            return this.resources.length;
        }

    }
}