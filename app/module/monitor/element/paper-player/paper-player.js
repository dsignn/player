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
            defaultTimeslotReference: {
                type: Object,
                notify : true,
                value: null
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
            polygonPoints : {
                type: Array,
                value: [],
                observer: '_changePolygonPoints'
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
            '_changeDefaultTimeslot(defaultTimeslotReference, _timeslotStorage)',
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

        newValue.on(
            AbstractTimeslotService.CHANGE_TIME,
            this._changeTimeTimeslot.bind(this)
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
        // TODO remove?
        //this.polygonPoints = [];
        this.polygonPoints = monitor.polygonPoints;

        return this;
    }

    /**
     * @param {TimeslotEntity} timeslot
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
                50
            );
        }
    }

    /**
     * @param layer
     */
    clearLayer(layer) {
        if (!this.$[layer]) {
            return;
        }

        let childrenNodes = this.$[layer].childNodes;
        for (let cont = 0; childrenNodes.length > cont; cont--) {
            childrenNodes[cont].remove();
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
                query = `paper-player-timeslot[timeslot-id="${timeslot.id}"]:not([wrapper-timeslot-id])`;
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

        /**
         * @type {TimeslotEntity}
         */
        let timeslot =  this._hydrateTimeslot(msg.timeslot);
        let element = this._createPaperPlayerTimeslot(timeslot, msg.data, msg.context);
        this.appendTimeslot(timeslot.context, element);
        this.clearLayerButNotLast(timeslot);
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
        if ( msg.timeslot !== null && this.identifier !== msg.timeslot.monitorContainerReference.id) {
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
                let timeslot =  this._hydrateTimeslot(msg.timeslot);
                let paperPlayerTimeslot = this._createPaperPlayerTimeslot(timeslot, msg.data, msg.context);
                this.appendTimeslot(timeslot.context, paperPlayerTimeslot);
                this.clearLayerButNotLast(timeslot);
                paperPlayerTimeslot.resume(msg.timeslot.currentTime);
                break;
        }
    }

    /**
     * TODO add public interface
     *
     * @param evt
     * @param msg
     * @private
     */
    _changeTimeTimeslot(evt, msg) {
        // The timeslot is not associate to thi monitor
        if ( msg.timeslot !== undefined && this.identifier !== msg.timeslot.monitorContainerReference.id) {
            return;
        }

        let element = this.getTimeslotElement(msg.timeslot, msg.context);
        let timeslot = this._hydrateTimeslot(msg.timeslot);

        switch (true) {
            case element !== null && timeslot.id === element.timeslotId:
                // TODO pass currentTime to resume
                element.resume(msg.timeslot.currentTime);
                break;
            default:
                let paperPlayerTimeslot = this._createPaperPlayerTimeslot(timeslot, msg.data, msg.context);
                this.appendTimeslot(timeslot.context, paperPlayerTimeslot);
                this.clearLayerButNotLast(timeslot);
                paperPlayerTimeslot.resume(msg.timeslot.currentTime);
                break;
        }
    }

    /**
     * @param timeslot
     * @param data
     * @param context
     * @return HTMLElement
     * @private
     */
    _createPaperPlayerTimeslot(timeslot, data, context) {
        let paperPlayerTimeslot = document.createElement('paper-player-timeslot');
        paperPlayerTimeslot.resourceService = this._resourceService;

        paperPlayerTimeslot.height = this.height;
        paperPlayerTimeslot.width  = this.width;
        paperPlayerTimeslot.filters = timeslot.filters;
        paperPlayerTimeslot.config(timeslot, context);
        paperPlayerTimeslot.data = data;

        return paperPlayerTimeslot
    }

    /**
     * @param defaultTimeslotReference
     * @param storage
     * @private
     */
    _changeDefaultTimeslot(defaultTimeslotReference, storage) {

        if (!defaultTimeslotReference || !defaultTimeslotReference.id || !storage) {
            return;
        } else {
            this.clearLayer('backgrond');
        }

        storage.get(defaultTimeslotReference.id)
            .then((timeslot) => {
                // TODO how retrive data?
                let element = this._createPaperPlayerTimeslot(timeslot, {}, 'backgrond');
                this.appendTimeslot('backgrond', element);
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
                this.$.container.style.backgroundColor = !!newValue ? newValue : 'transparent';
            },
            500
        );
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
     * @private
     */
    _changePolygonPoints(newValue) {
        if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
            return;
        }

        let stringPolygon = '';
        for(let cont = 0; newValue.length > cont; cont++) {
            stringPolygon += `${newValue[cont].x}px ${newValue[cont].y}px`;
            if ((cont+1) < newValue.length) {
                stringPolygon += ',';
            }
        }

        this.style.clipPath = `polygon(${stringPolygon})`;
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
