/**
 *
 */
class Pagination extends Array {


    /**
     * @param {Array|null} items
     * @param {Number} page
     * @param {Number} itemPerPage
     * @param {Number} totalItem
     */
    constructor(items = [], page, itemPerPage, totalItem) {

        super();

        if (Array.isArray(items)) {
            items.forEach(
                element => { this.push(element); }
            );
        }

        /**
         * @type {Number}
         */
        this.page = page;

        /**
         * @type {Number}
         */
        this.itemPerPage = itemPerPage;

        /**
         * @type {Number}
         */
        this.totalItems = totalItem;
    }
}

module.exports = Pagination;