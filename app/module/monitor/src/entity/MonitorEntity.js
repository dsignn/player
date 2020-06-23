import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class MonitorEntity
 */
export class MonitorEntity extends EntityIdentifier {

    constructor() {
        super();

        /**
         * @type {string|null}
         */
        this.name = null;

        /**
         * @type {Number}
         */
        this.height  = 0;

        /**
         * @type {Number}
         */
        this.width   = 0;

        /**
         * @type {Number}
         */
        this.offsetX = 0;

        /**
         * @type {Number}
         */
        this.offsetY = 0;

        /**
         * @type {boolean}
         */
        this.alwaysOnTop = false;

        /**
         * @type {String}
         */
        this.backgroundColor = 'transparent';

        /**
         * @type {Array}
         */
        this.polygonPoints = [];

        /**
         * @type {Array}
         */
        this.monitors = [];

        /**
         * @type {object}
         */
        this.defaultTimeslotReference = {};
    }

    /**
     *
     * @param options
     * @return {Array}
     */
    getMonitors(options) {
        let monitors = this.monitors;
        if (!options || !options.withoutRoot) {
            monitors = monitors.concat(this);
        }

        if (options && typeof options === 'object' && options.nested) {
            for (let cont = 0; this.monitors.length > cont; cont++) {
                if (typeof this.monitors[cont].getMonitors === "function") {
                    let nestedOptions = JSON.parse(JSON.stringify(options));
                    nestedOptions.withoutRoot = true;
                    let nestedMonitor = this.monitors[cont].getMonitors(nestedOptions);
                    if (nestedMonitor.length > 0) {
                        monitors = monitors.concat(nestedMonitor);
                    }
                }
            }
        }
        return monitors;
    }

    /**
     * @param id
     * @returns {*}
     */
    getMonitor(id) {
        let monitors = this.getMonitors({nested:true});

        if (this.id === id) {
            return this;
        }

        return monitors.find(
            (element) => {
                return element.id === id;
            }
        );
    }

    /**
     * @param {string} id
     * @returns {boolean}
     */
    hasMonitor(id) {
        let monitors = this.getMonitors({nested:true});

        if (this.id === id) {
            return true;
        }

        return !!monitors.find(
            (element) => {
                return element.id === id;
            }
        );
    }

    /**
     * @param {string} id
     * @returns {MonitorEntity|null}
     */
    getParent(id) {

        let parent = null;
        let parentRecursive = null;
        if (this.monitors.length === 0) {
            return null;
        }

        for (let cont = 0; this.monitors.length > cont; cont++) {
            if (this.monitors[cont].id === id) {
                return this;
            } else {
                parentRecursive = this.monitors[cont].getParent(id);
                parent = (parentRecursive !== null) ? parentRecursive : parent;
            }
        }
        return parent;
    }

    /**
     * @param {MonitorEntity} monitor
     * @returns {MonitorEntity}
     */
    addMonitor(monitor) {
        this.monitors.push(monitor);
        return this;
    }

    /**
     * @param monitor
     */
    removeMonitor(monitor) {

        let remove = false;
        if (this.monitors.length > 0) {
            for (let cont = 0; this.monitors.length > cont; cont++) {

                switch (true) {
                    case monitor.id === this.monitors[cont].id :
                        this.monitors.splice(cont, 1);
                        return true;
                        break;

                    case typeof this.monitors[cont].removeMonitor === "function":
                        remove = remove || this.monitors[cont].removeMonitor(monitor);
                        break
                }

            }
        }
        return remove;
    }
}
