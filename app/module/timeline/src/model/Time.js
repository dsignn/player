/**
 *
 */
class Time {

    /**
     * @param {number} hours
     * @param {number} minutes
     * @param {number} seconds
     */
    constructor(hours = 0, minutes = 0, seconds = 0) {

        /**
         * @type {number}
         */
        this.hours = hours;

        /**
         * @type {number}
         */
        this.minutes = minutes;

        /**
         * @type {number}
         */
        this.seconds = seconds;
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

    /**
     * @return {Time}
     */
    clone() {
        let clone = new Time();

        clone.seconds = this.seconds;
        clone.minutes = this.minutes;
        clone.hours = this.hours;

        return clone;
    }

    /**
     * @return {string}
     */
    toString() {
        return `${this.getHours() < 10 ? '0' + this.getHours() : this.getHours()}:${this.getMinutes() < 10 ? '0' + this.getMinutes() : this.getMinutes()}:${this.getSeconds() < 10 ? '0' + this.getSeconds() : this.getSeconds()}`;
    }
}

module.exports = Time;