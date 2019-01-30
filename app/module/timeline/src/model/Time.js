/**
 *
 */
class Time {

    constructor() {

        /**
         * @type {number}
         */
        this.hours = 0;

        /**
         * @type {number}
         */
        this.minutes = 0;

        /**
         * @type {number}
         */
        this.seconds = 0;
    }

    /**
     * @param {Time} time
     * @return {number}
     */
    compare(time) {
       switch (true) {

           case this.getHours() === time.getHours() && this.getMinutes() === time.getMinutes() && this.getSeconds() === time.getSeconds():
               return 0;
               break;
           case this.getHours() > time.getHours() ||
                this.getHours() === time.getHours() && this.getMinutes() > time.getMinutes() ||
                this.getHours() === time.getHours() && this.getMinutes() === time.getMinutes() && this.getSeconds() > time.getSeconds():

               return -1;
           default:
               return 1;

       }
    }

    /**
     * @return {number}
     */
    getHours() {
        return parseInt(this.hours);
    }

    /**
     * @return {number}
     */
    getMinutes() {
        return parseInt(this.minutes);
    }

    /**
     * @return {number}
     */
    getSeconds() {
        return parseInt(this.seconds);
    }
}

module.exports = Time;