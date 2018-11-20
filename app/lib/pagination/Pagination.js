/**
 *
 */
class Pagination extends Array {


    /**
     * @param items
     * @param page
     * @param itemPerPage
     * @param totalItem
     */
    constructor(items = [], page, itemPerPage, totalItem) {

        super();

        this.appendArray(items);
        this.page = page;
        this.itemPerPage = itemPerPage;
        this.totalItems = totalItem;
    }

    /**
     * @param list
     */
    appendArray(list) {
        if (Array.isArray(list)) {
            list.forEach(
                element => {
                    this.push(element);
                }
            );
        }
    }
}

module.exports = Pagination;