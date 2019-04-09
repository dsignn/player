/**
 *
 */
class DashboardConfig extends require("@p3e/library").container.ContainerAware {

    /**
     *
     * @return {string}
     * @constructor
     */
    static get COLLECTION() { return 'dashboard'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get STORAGE_SERVICE() { return 'DashboardStorage'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get ENTITY_SERVICE() { return 'DashboardEntity'; };

    /**
     *
     * @return {string}
     * @constructor
     */
    static get HYDRATOR_SERVICE() { return 'DashboardEntityHydrator'; };


    /**
     * 
     */
    init() {


    }
}


module.exports = DashboardConfig;
