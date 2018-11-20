try {
    HydratorAware = require('./../HydratorAware');
    EvtManager = require('./../EvtManager');
    Utils = require('./../Utils');
}
catch (err) {

    HydratorAware = require(__dirname + '/lib/hydrator/HydratorAware.js');
    EvtManager = require(__dirname + '/lib/event/EvtManager.js');
    Utils = require(__dirname + '/lib/Utils.js');
}

/**
 *
 */
class Storage extends HydratorAware {

    static get STORAGE_PRE_SAVE() {
        return 'pre-save'
    };

    static get STORAGE_POST_SAVE() {
        return 'post-save'
    };

    static get STORAGE_PRE_UPDATE() {
        return 'pre-update'
    };

    static get STORAGE_POST_UPDATE() {
        return 'post-update'
    };

    static get STORAGE_PRE_REMOVE() {
        return 'pre-remove'
    };

    static get STORAGE_POST_REMOVE() {
        return 'post-remove'
    };

    /**
     * @return {number}
     */
    static get DEFAULT_PAGE() {
        return 1;
    }

    /**
     * @return {number}
     */
    static get DEFAULT_ITEM_COUNT() {
        return 5;
    }

    /**
     * @param adapter
     */
    constructor(adapter, hydrator) {
        super(hydrator);
        this.adapter = adapter;
        this.eventManager = new EvtManager();
    }

    /**
     *
     * @param obj
     * @return {Promise}
     */
    save(obj) {

        obj.id = Utils.uid;
        let data = this.hydrator ? this.hydrator.extract(obj) : obj;

        let promise = new Promise((resolve, reject) => {

            this.eventManager.fire(Storage.STORAGE_PRE_SAVE, obj);

            this.adapter.save(data)
                .then(
                    (data) => {

                        this.eventManager.fire(Storage.STORAGE_POST_SAVE, obj);

                        resolve(obj);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject(null);
                })
        });

        return promise;
    }

    /**
     * @param obj
     * @return {Promise}
     */
    update(obj) {
        let data = this.hydrator ? this.hydrator.extract(obj) : obj;

        let promise = new Promise((resolve, reject) => {

            this.eventManager.fire(Storage.STORAGE_PRE_UPDATE, obj);

            this.adapter.update(data)
                .then(
                    (data) => {

                        this.eventManager.fire(Storage.STORAGE_POST_UPDATE, obj);

                        resolve(obj);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject(null);
                })
        });
        return promise;
    }

    /**
     *
     * @param id
     * @return {Promise}
     */
    get(id) {

        let promise = new Promise((resolve, reject) => {
            this.adapter.get(id)
                .then(
                    (data) => {
                        let obj = this.hydrator ? this.hydrator.hydrate(data) : data;
                        resolve(obj);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject(null);
                }
            );
        });

        return promise;
    }

    /**
     * @param {Object} search
     * @return {Promise}
     */
    getAll(search) {

        let promise = new Promise((resolve, reject) => {

            this.adapter.getAll(search)
                .then(
                    (data) => {
                        for (let cont = 0; data.length > cont; cont++) {
                            data[cont] = this.hydrator ? this.hydrator.hydrate(data[cont]) : data[cont];
                        }

                        resolve(data);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject([]);
                }
            );
        });

        return promise;
    }

    /**
     * @param {Integer} page
     * @param {Integer} itemCount
     * @param {Object} search
     * @return {Promise}
     */
    getPaged(page, itemCount, search) {

        let promise = new Promise((resolve, reject) => {

            let currentPage = page ? page : Storage.DEFAULT_PAGE;
            let currentItemCount = itemCount ? itemCount : Storage.DEFAULT_ITEM_COUNT;

            this.adapter.getPaged(currentPage, currentItemCount, search)
                .then(
                    (data) => {
                        for (let cont = 0; data.length > cont; cont++) {
                            data[cont] = this.hydrator ? this.hydrator.hydrate(data[cont]) : data[cont];
                        }

                        resolve(data);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject([]);
                }
            );
        });

        return promise;
    }

    /**
     * @param obj
     * @return {Promise}
     */
    remove(obj) {

        let promise = new Promise((resolve, reject) => {

            this.eventManager.fire(Storage.STORAGE_PRE_REMOVE, obj);
            this.adapter.remove(obj)
                .then(
                    (data) => {
                        this.eventManager.fire(Storage.STORAGE_POST_REMOVE, obj);
                        resolve(data);
                    }
                ).catch(
                (err) => {
                    console.error(err);
                    reject([]);
                }
            );
        });

        return promise;

    }


    /**
     *
     * @param obj
     * @return {boolean}
     * @private
     */
    _checkObj(obj) {
        if (!(typeof obj === "object") || obj === null) {
            throw "Wrong obj: obj must be an object"
        }
        return true;
    }
}