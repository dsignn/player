
class Sideline {

    constructor() {

        /**
         * @type {null|string}
         */
        this.name = null;

        /**
         * @type {null|Number}
         */
        this.height = null;

        /**
         * @type {null|Number}
         */
        this.width = null;

        /**
         *
         * @type {null|Object}
         */
        this.virtualMonitorReference = {};

        /**
         * @type {Array}
         */
        this.sidelines = [];
    }

    /**
     *
     * @param options
     * @return {Array}
     */
    getSidelines(options) {
        let sidelines = this.sidelines;
        if (options.isNested !== true) {
            sidelines = sidelines.concat(this);
        }
        options.isNested = true;
        if (options && typeof options === 'object' && options.nested) {
            for (let cont = 0; this.sidelines.length > cont; cont++) {
                if (typeof this.sidelines[cont].getSidelines === "function") {
                    let nestedSideline = this.sidelines[cont].getSidelines(options);
                    if (nestedSideline.length > 0) {
                        sidelines = sidelines.concat(nestedSideline);
                    }
                }
            }
        }
        return sidelines;
    }


    /**
     * @param sideline
     * @returns {Sideline}
     */
    pushSideline (sideline) {
        this.sidelines.push(sideline);
        return this;
    }

    /**
     *
     * @param sideline
     * @returns {T[]}
     */
    removeSideline(sideline) {
        if (sideline === null || typeof sideline !== 'object' ) {
            throw 'wrong input for removeSideline';
        }

        return this._removeSidelineRecoursive(sideline, this);
    }

    /**
     * @param toRemove
     * @param current
     * @returns {T[]}
     * @private
     */
    _removeSidelineRecoursive(toRemove, current) {
        for (let cont = 0; current.sidelines.length > cont; cont++) {
            if (current.sidelines[cont].id === toRemove.id) {
                return current.sidelines.splice(cont, 1);
            }

            if (typeof current.sidelines[cont].sidelines.length > 0) {
                this._removeSidelineRecoursive(toRemove, current.sidelines[cont]);
            }
        }
    }
}

module.exports = Sideline;