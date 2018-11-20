/**
 *
 */
class Monitor {

    constructor() {
        this.name    = null;
        this.height  = 0;
        this.width   = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.backgroundColor = 'transparent';
        /**
         * TODO now string but in the future will be an array of point
         * @type {null}
         */
        this.polygon = null;
        this.monitors = [];

        this.defaultTimeslotId = null;
    }

    /**
     *
     * @param options
     * @return {Array}
     */
    getMonitors(options) {
        let monitors = [this];
        if (options && typeof options === 'object' && options.nested) {
            for (let cont = 0; this.monitors.length > cont; cont++) {
                if (typeof this.monitors[cont].getMonitors === "function") {
                    let nestedMonitor = this.monitors[cont].getMonitors(options);
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
     * @param {Monitor} monitor
     * @returns {VirtualMonitor}
     */
    pushMonitor (monitor) {
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

module.exports = Monitor;