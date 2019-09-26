import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../../../elements/mixin/service/injector-mixin";

/**
 * @customElement
 * @polymer
 */
class PaperPlayer extends ServiceInjectorMixin(PolymerElement) {

    static get template() {
        return html`
            <style >
                :host {
                    display: flex;
                    position: absolute;
                    overflow: hidden;
                }
    
                .layers {
                    padding: 0;
                    margin: 0;
                    height: 100%;
                    width: 100%;
                    position: relative;
                }
    
                .layer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    background-color: transparent;
                }
    
                .backgrond {
                    z-index: 1;
                }
    
                .standard {
                    z-index: 2;
                }
    
                .monitors {
                    z-index: 3;
                }
    
                .overlay {
                    z-index: 4;
                }
    
            </style>
            <div id="container" class="layers">
                <div id="backgrond"  class="layer backgrond"></div>
                <div id="standard" class="layer standard"></div>
                <div id="monitors" class="layer monitors"></div>
                <div id="overlay"  class="layer overlay"></div>
            </div>
        `
    }

    static get properties () {
        return {

            /**
             * @type string
             */
            nodeName : {
                type: String,
                readOnly: true,
                value: 'paperMonitor'
            },

            /**
             * @type string
             */
            identifier: {
                type: String,
                reflectToAttribute : true,
            },

            /**
             * @type string
             */
            defaultTimeslotId: {
                type: String,
                notify : true
            },

            /**
             * @type number
             */
            height: {
                type: Number,
                notify : true,
                observer: '_changeHeight'
            },

            /**
             * @type number
             */
            width: {
                type: Number,
                notify : true,
                observer: '_changeWidth'
            },

            backgroundColor : {
                type: String,
                observer: '_changeBackgroundColor'
            },

            /**
             * @type number
             */
            offsetX : {
                type: Number,
                value: 0,
                observer: '_changeOffsetX'
            },

            /**
             * @type number
             */
            offsetY : {
                type: Number,
                value: 0,
                observer: '_changeOffsetY'
            },

            /**
             * @type string
             */
            polygon : {
                type: String,
                observer: '_changePolygon'
            },

            /**
             * @type object
             */
            timeslotDefault : {},

            /**
             * @type object
             */
            services : {
                value : {
                    "_resourceService": "ResourceService",
                    "ReceiverContainerAggregate": {
                        "_timeslotReceiver" : "TimeslotReceiver"
                    },
                    // TODO add storage service on the player
                    "StorageContainerAggregate": {
                        "_timeslotStorage":"TimeslotStorage"
                    },
                    "HydratorContainerAggregate": {
                        "_timeslotEntityHydrator" : "TimeslotEntityHydrator"
                    }
                }
            },

            /**
             * @type ResourceService
             */
            _resourceService: {
                type: Object,
                readOnly: true
            },

            /**
             * @type ReceiverInterface
             */
            _timeslotReceiver : {
                type: Object,
                readOnly: true,
                observer: '_changeTimeslotReceiver'
            },

            /**
             * @type StorageInterface
             */
            _timeslotStorage : {
                type: Object,
                readOnly: true
            },

            /**
             * @type HydratorInteface
             */
            _timeslotEntityHydrator : {
                type: Object,
                readOnly: true
            }
        }
    }

    static get observers() {
        return [
            '_changeDefaultTimeslotId(defaultTimeslotId, _timeslotStorage)',
        ]
    }

    /**
     * @param newValue
     * @private
     */
    _changeTimeslotReceiver(newValue) {

        if (!newValue) {
            return;
        }

        newValue.on(
            AbstractTimeslotService.PLAY,
            this._startTimeslot.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.STOP,
            this._stopTimeslot.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.PAUSE,
            this._pauseTimeslot.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.RESUME,
            this._resumeTimeslot.bind(this)
        );
    }

    /**
     * @param {Monitor} monitor
     */
    updateValueFromMonitor(monitor) {
        this.setStyles(monitor);
        let nodeMonitors = Array.prototype.slice.call(
            this.shadowRoot.querySelectorAll('paper-player')
        );

        for (let cont = 0; monitor.monitors.length > cont; cont++) {
            monitor.monitors[cont].addToDom = true;
            for (let subCont = 0; nodeMonitors.length > subCont; subCont++) {
                if (nodeMonitors[subCont].identifier === monitor.monitors[cont].id) {
                    /**
                     * update style
                     */
                    nodeMonitors[subCont].setStyles(monitor.monitors[cont]);
                    monitor.monitors[cont].addToDom = false;

                    if (monitor.monitors[cont].monitors.length > 0) {
                        nodeMonitors[subCont].updateValueFromMonitor(monitor.monitors[cont]);
                        console.log('AGGIORNIAMO SUB');
                    }
                    console.log('MODIFY', nodeMonitors[subCont]);
                    nodeMonitors[subCont].removeToDom = false;
                    nodeMonitors.splice(subCont, 1);

                }
            }
        }

        for (let cont = 0; nodeMonitors.length > cont; cont++) {
            console.log('REMOVE', nodeMonitors[cont]);
            nodeMonitors[cont].remove();
        }

        for (let cont = 0; monitor.monitors.length > cont; cont++) {
            if ( monitor.monitors[cont].addTDom === true) {

                let monitorElement = document.createElement("paper-player");
                monitorElement.identifier =  monitor.monitors[cont].id;
                monitorElement.setStyles( monitor.monitors[cont]);
                this.appendMonitor(monitorElement);
                console.log('APPEND', monitorElement);
            }
        }
        // TODO add to dom;
    }

    /**
     * @param {MonitorEntity} monitor
     */
    setStyles(monitor) {
        this.height = monitor.height;
        this.width = monitor.width;
        this.offsetX = monitor.offsetX;
        this.offsetY = monitor.offsetY;
        this.backgroundColor = monitor.backgroundColor;
        this.polygon = monitor.polygon;
        return this;
    }

    /**
     * @param {Timeslot} timeslot
     */
    clearLayerButNotLast(timeslot) {
        if (!this.$[timeslot.context]) {
            return;
        }

        let childrenNodes = this.$[timeslot.context].childNodes;
        // Clear layer
        for (let cont = childrenNodes.length - 2; cont >= 0; cont--) {
            setTimeout(
                function() {
                    this.remove();
                }.bind(childrenNodes[cont]),
                300
            );
        }
    }

    /**
     * @param layer
     * @param wsTimeslot
     */
    appendTimeslot(layer, wsTimeslot) {
        this.$[layer].appendChild(wsTimeslot);
    }

    /**
     * @param playerMonitor
     */
    appendMonitor(playerMonitor) {
        this.$.monitors.appendChild(playerMonitor);
    }

    /**
     * @param timeslot
     * @params context
     * @private
     */
    getTimeslotElement(timeslot, context = {}) {

        let query = '';
        switch (true) {
            case context.serviceId !== undefined:
                query = `paper-player-timeslot[wrapper-timeslot-id="${context.serviceId}"]`;
                break;
            case timeslot !== undefined:
                query = `paper-player-timeslot[timeslot-id="${timeslot.id}"]:not([wrapper-timeslot-id=""])`;
                break;
        }
        return this.shadowRoot.querySelector(query);
    }

    /**
     * @param evt
     * @param msg
     * @private
     */
    _startTimeslot(evt, msg) {
        // The timeslot is not associate to thi monitor
        if (msg.timeslot.monitorContainerReference.id != this.identifier) {
            return;
        }

        this.startTimeslot(this._hydrateTimeslot(msg.timeslot), msg.data, msg.context);
    }

    /**
     * @param {Timeslot} timeslot
     * @param {Object|null} data
     * @param context
     */
    startTimeslot(timeslot, data, context) {
        let playerTimeslot = document.createElement('paper-player-timeslot');
        // TODO refactor service injector
        playerTimeslot.resourceService = this._resourceService;

        playerTimeslot.height = this.height;
        playerTimeslot.width  = this.width;
        playerTimeslot.filters = timeslot.filters;
        playerTimeslot.config(timeslot, context);
        playerTimeslot.data = data;

        this.appendTimeslot(timeslot.context, playerTimeslot);
        this.clearLayerButNotLast(timeslot);
        console.log('append TM');
    }

    /**
     * TODO add public interface
     *
     * @param evt
     * @param msg
     * @private
     */
    _stopTimeslot(evt, msg) {
        // Check if the message is not broadcast and not this monitor
        if ( msg.timeslot !== null && this.identifier !== msg.timeslot.monitorContainerReference.id) {
            return;
        }

        let element = this.getTimeslotElement(msg.timeslot, msg.context);
        if (element) {
            console.log('MONITOR STOP TIMESLOT', element);
            element.remove();
        }
    }

    /**
     * TODO add public interface
     *
     * @param evt
     * @param msg
     * @private
     */
    _pauseTimeslot(evt, msg) {
        // The timeslot is not associate to thi monitor
        if ( msg.timeslot !== undefined && this.identifier !== msg.timeslot.monitorContainerReference.id) {
            return;
        }

        let element = this.getTimeslotElement(msg.timeslot,  msg.context);
        if (element) {
            console.log('MONITOR STOP TIMESLOT', msg.timeslot);
            element.pause();
        }
    }

    /**
     * TODO add public interface
     *
     * @param evt
     * @param msg
     * @private
     */
    _resumeTimeslot(evt, msg) {
        // The timeslot is not associate to thi monitor
        if ( msg.timeslot !== undefined && this.identifier !== msg.timeslot.monitorContainerReference.id) {
            return;
        }

        let element = this.getTimeslotElement(msg.timeslot, msg.context);
        console.log('MONITOR RESUME TIMESLOT', msg.timeslot);

        switch (true) {
            case element !== null:
                // TODO pass currentTime to resume
                element.resume(msg.timeslot.currentTime);
                break;
            default:
                let timeslotWc = document.createElement('paper-player-timeslot');
                timeslotWc.resourceService = this._resourceService;
                let timeslot = this._hydrateTimeslot(msg.timeslot);
                timeslotWc.height = this.height;
                timeslotWc.width  = this.width;
                timeslotWc.data = msg.data;
                timeslotWc.config(timeslot);
                timeslotWc.startAt = timeslot.currentTime;
                timeslotWc.filters = timeslot.filters;

                this.appendTimeslot(timeslot.context, timeslotWc);
                this.clearLayerButNotLast(timeslot);
                break;
        }
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeDefaultTimeslotId(defaultTimeslotId, storage) {

        if (!defaultTimeslotId || !storage) {
            return;
        }

        storage.get(defaultTimeslotId)
            .then((timeslot) => {
                timeslot.context = 'default';
                this.startTimeslot(timeslot);
            });

    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeHeight(newValue, oldValue) {
        if (!newValue) {
            return;
        }
        this.style.height = newValue + 'px';
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeWidth(newValue, oldValue) {
        if (!newValue) {
            return;
        }
        this.style.width = newValue + 'px';
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeBackgroundColor(newValue, oldValue) {
        if (!newValue) {
            return;
        }
        setTimeout(
            () => {
                this.$.container.style.backgroundColor = newValue === '#ffffff' ? 'transparent' : newValue
            },
            500
        );
        // TODO migliore il color picker per gestire la trasparenza

    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeOffsetX(newValue, oldValue) {
        if (!newValue || (this.parentElement && this.parentElement.tagName === 'BODY')) {
            return;
        }
        this.style.left = newValue + 'px';
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeOffsetY(newValue, oldValue) {
        if (!newValue || (this.parentElement && this.parentElement.tagName === 'BODY')) {
            return;
        }
        this.style.top = newValue + 'px';
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changePolygon(newValue, oldValue) {
        if (!newValue) {
            return;
        }
        this.style.clipPath = `polygon(${newValue})`;
    }

    /**
     * @param data
     * @returns {TimeslotEntity}
     * @private
     */
    _hydrateTimeslot(data) {
        let timeslot = this._timeslotEntityHydrator.hydrate(data);

        if (!(timeslot instanceof TimeslotEntity)) {
            console.error('Wrong data timeslot');
        }

        return timeslot;
    }
}
window.customElements.define('paper-player', PaperPlayer);
