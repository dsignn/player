
class SidelineResource {

    constructor() {

        /**
         * @type {null|string}
         */
        this.nameResource = null;

        /**
         * @type {null|sidelineReference}
         */
        this.sidelineReference = null;

        /**
         * @type {Array}
         */
        this.resourcesInSideline = [];
    }

    /**
     * @return {boolean}
     */
    isSingleSidelineResource() {
        let result = false;

        if (this.sidelineReference === null || this.resourcesInSideline.length === 0) {
            return result;
        }

        if (this.resourcesInSideline.length === 1 &&
            this.resourcesInSideline[0] &&
            this.resourcesInSideline[0].sidelineReference &&
            this.resourcesInSideline[0].sidelineReference.sidelineId === this.sidelineReference.sidelineId)
        {
            result = true;
        }

        return result;
    }

    /**
     * @param {Sideline} sideline
     * @return {Array}
     */
    getArrayResourceFromSidelineResource(sideline) {

        let arrayResource = [];
        for (let cont = 0; this.resourcesInSideline.length > cont; cont++) {
            if(this.resourcesInSideline[cont].sidelineReference.sidelineId === sideline.id) {
                arrayResource = this.resourcesInSideline[cont].resources;
                break
            }
        }

        return arrayResource;
    }
}

module.exports = SidelineResource;