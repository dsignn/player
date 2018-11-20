/**
 *
 */
class VirtualMonitor {

    constructor() {
        this.id    = null;
        this.name  = null;
        this.enable = 0;
        this.monitors = [];
    }

    /**
     * @param monitor
     * @returns {VirtualMonitor}
     */
    pushMonitor (monitor) {
        this.monitors.push(monitor);
        return this;
    }

    /**
     * @returns {Array}
     */
    getMonitors(options) {
        let monitors = [];
        if (options && typeof options === 'object' && options.nested) {
           for (let cont = 0; this.monitors.length > cont; cont++) {
               if (typeof this.monitors[cont].getMonitors === "function") {
                   let nestedMonitor = this.monitors[cont].getMonitors(options);
                   if (nestedMonitor.length > 0) {
                       monitors = monitors.concat(nestedMonitor);
                   }
               }
           }
        } else {
            monitors = this.monitors;
        }
        return monitors;
    }

    /**
     * @param monitor
     */
    removeMonitor(monitor) {
        if (monitor === null || typeof monitor !== 'object' ) {
            throw 'wrong input for removeMonitor';
        }

        let remove = false;
        for (let cont = 0; this.monitors.length > cont; cont++) {

            if (remove) {
                continue;
            }

            if (this.monitors[cont].id === monitor.id) {
                this.monitors.splice(cont, 1);
                remove = true;
            }

            if (typeof this.monitors[cont] === 'object' && typeof this.monitors[cont].removeMonitor === "function") {
                remove = this.monitors[cont].removeMonitor(monitor);
            }
        }
        return remove;
    }

    /**
     * @returns {VirtualMonitor}
     */
    clearMonitors() {
        this.monitors = [];
        return this;
    }

    /**
     * @param id
     * @returns {*}
     */
    getMonitor(id) {
        let monitors = this.getMonitors({nested:true});
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
        return !!monitors.find(
            (element) => {
                return element.id === id;
            }
        );
    }

}

module.exports = VirtualMonitor;