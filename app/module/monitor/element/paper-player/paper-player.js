import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { FileEntity } from './../../../resource/src/entity/FileEntity'
import { MultiMediaEntity } from './../../../resource/src/entity/MultiMediaEntity'

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

    static get properties() {
        return {

            /**
             * @type string
             */
            nodeName: {
                type: String,
                readOnly: true,
                value: 'paperMonitor'
            },

            /**
             * @type string
             */
            identifier: {
                type: String,
                reflectToAttribute: true,
            },

            /**
             * @type string
             */
            defaultTimeslotReference: {
                type: Object,
                notify: true,
                value: null
            },

            /**
             * @type number
             */
            height: {
                type: Number,
                notify: true,
                observer: '_changeHeight'
            },

            /**
             * @type number
             */
            width: {
                type: Number,
                notify: true,
                observer: '_changeWidth'
            },

            backgroundColor: {
                type: String,
                observer: '_changeBackgroundColor'
            },

            /**
             * @type number
             */
            offsetX: {
                type: Number,
                value: 0,
                observer: '_changeOffsetX'
            },

            /**
             * @type number
             */
            offsetY: {
                type: Number,
                value: 0,
                observer: '_changeOffsetY'
            },

            /**
             * @type string
             */
            polygonPoints: {
                type: Array,
                value: [],
                observer: '_changePolygonPoints'
            },

            /**
             * @type object
             */
            timeslotDefault: {},

            /**
             * @type object
             */
            services: {
                value: {
                    "_resourceService": "ResourceService",
                    "ReceiverContainerAggregate": {
                        "_timeslotReceiver": "TimeslotReceiver"
                    },
                    // TODO add storage service on the player
                    "StorageContainerAggregate": {
                        "_timeslotStorage": "TimeslotStorage"
                    },
                    "HydratorContainerAggregate": {
                        "_resourceMonitorHydrator": "ResourceMonitorHydrator"
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
            _timeslotReceiver: {
                type: Object,
                readOnly: true,
                observer: '_changeResourceReceiver'
            },

            /**
             * @type StorageInterface
             */
            _timeslotStorage: {
                type: Object,
                readOnly: true
            }
        }
    }

    static get observers() {
        return [
            '_changeDefaultResource(defaultTimeslotReference, _timeslotStorage)',
        ]
    }

    /**
     * @param newValue
     * @private
     */
    _changeResourceReceiver(newValue) {

        if (!newValue) {
            return;
        }

        newValue.on(
            AbstractTimeslotService.PLAY,
            this._startResource.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.STOP,
            this._stopResource.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.PAUSE,
            this._pauseResource.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.RESUME,
            this._resumeResource.bind(this)
        );

        newValue.on(
            AbstractTimeslotService.CHANGE_TIME,
            this._changeTimeResource.bind(this)
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
            if (monitor.monitors[cont].addTDom === true) {

                let monitorElement = document.createElement("paper-player");
                monitorElement.identifier = monitor.monitors[cont].id;
                monitorElement.setStyles(monitor.monitors[cont]);
                this.$.monitors.appendChild(monitorElement);
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
     * @param { resourceEntity } resourceEntity
     */
    clearLayerButNotLast(resourceEntity) {
        if (!this.$[resourceEntity.getContext()]) {
            return;
        }

        let childrenNodes = this.$[resourceEntity.getContext()].childNodes;
        // Clear layer
        for (let cont = childrenNodes.length - 2; cont >= 0; cont--) {
            setTimeout(
                function () {
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
     * @param resource
     * @params context
     * @private
     */
    getResourceElement(resource, context = {}) {

        let query = '';
        switch (true) {
            case context.serviceId !== undefined:
                query = `paper-player-resource[wrapper-resource-id="${context.serviceId}"]`;
                break;
            case resource !== undefined:
                query = `paper-player-resource[resource-id="${resource.id}"]:not([wrapper-resource-id])`;
                break;
        }
        return this.shadowRoot.querySelector(query);
    }

    /**
     * @param evt
     * @param msg
     * @private
     */
    _startResource(evt, msg) {
        if (msg.resource.monitorContainerReference.id != this.identifier) {
            return;
        }
        console.log('Start ');
     
        let resourceSenderEntity = this._hydrateResourceSender(msg.resource);
        let element = this._createPaperPlayerResource(resourceSenderEntity, msg.data, msg.context);
    
        this.$[resourceSenderEntity.resourceReference.getContext()].appendChild(element);
      
        this.clearLayerButNotLast(resourceSenderEntity.resourceReference);
    }

    /**
     * TODO add public interface
     *
     * @param evt
     * @param msg
     * @private
     */
    _stopResource(evt, msg) {
        console.log('stop');
        // Check if the message is not broadcast and not this monitor
        if (msg.resource !== null && this.identifier !== msg.resource.monitorContainerReference.id) {
            return;
        }

        let resourceSenderEntity = this._hydrateResourceSender(msg.resource);
        let element = this.getResourceElement(resourceSenderEntity.resourceReference, msg.context);
        if (element) {
            console.log('Stop resource', element);
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
    _pauseResource(evt, msg) {
        console.log('pause');
        if (msg.resource !== null && this.identifier !== msg.resource.monitorContainerReference.id) {
            return;
        }

        let resourceSenderEntity = this._hydrateResourceSender(msg.resource);
        let element = this.getResourceElement(resourceSenderEntity.resourceReference, msg.context);
        if (element) {
            console.log('Pause resource', resourceSenderEntity);
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
    _resumeResource(evt, msg) {
        console.log('resume');
        if (msg.resource !== undefined && this.identifier !== msg.resource.monitorContainerReference.id) {
            return;
        }
        let resourceSenderEntity = this._hydrateResourceSender(msg.resource);
        let element = this.getResourceElement(resourceSenderEntity.resourceReference, msg.context);
        console.log('Resume resource', resourceSenderEntity);

        switch (true) {
            case element !== null:
                // TODO pass currentTime to resume
                //element.resume(msg.timeslot.currentTime);
                break;
            default:

                let resourceSenderEntity = this._hydrateResourceSender(msg.resource);
                let paperPlayerResource = this._createPaperPlayerResource(resourceSenderEntity, msg.data, msg.context);

                this.$[resourceSenderEntity.resourceReference.getContext()].appendChild(paperPlayerResource);
                this.clearLayerButNotLast(resourceSenderEntity.resourceReference);
               // paperPlayerResource.resume(resourceSenderEntity.resourceReference.getCurrentTime());
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
    _changeTimeResource(evt, msg) {
        if (msg.resource !== undefined && this.identifier !== msg.resource.monitorContainerReference.id) {
            return;
        }

        let element = this.getResourceElement(msg.resource, msg.context);
        let resourceSenderEntity = this._hydrateResourceSender(msg.resource);

        switch (true) {
            case element !== null && resourceSenderEntity.resourceReference.id === element.resourceId:
                // TODO pass currentTime to resume
               // element.resume(msg.timeslot.currentTime);
                break;
            default:
                let paperPlayerResource = this._createPaperPlayerResource(resourceSenderEntity, msg.data, msg.context);
                this.$[resourceSenderEntity.resourceReference.getContext()].appendChild(element);
                this.clearLayerButNotLast(timeslot);
              
                // TODO current time
              //  paperPlayerResource.resume(msg.timeslot.currentTime);
                break;
        }
    }

    /**
     * @param resourceSenderEntity
     * @param data
     * @param context
     * @return HTMLElement
     * @private
     */
    _createPaperPlayerResource(resourceSenderEntity, data, context) {
        let paperPlayerResource = document.createElement('paper-player-resource');
        paperPlayerResource.resourceService = this._resourceService;
        paperPlayerResource.resourceEntity = resourceSenderEntity.resourceReference;

        paperPlayerResource.height = this.height;
        paperPlayerResource.width = this.width;
        //paperPlayerResource.filters = timeslot.filters;
        //paperPlayerResource.config(timeslot, context);
        paperPlayerResource.data = data;

        return paperPlayerResource
    }

    /**
     * @param data
     * @returns { ResourceSenderEntity }
     * @private
     */
    _hydrateResourceSender(data) {

        let resource = this._resourceMonitorHydrator.hydrate(data);

        if (!(resource.resourceReference instanceof MultiMediaEntity) && !(resource.resourceReference instanceof FileEntity)) {
            console.error('Wrong data resource', resource);
        }

        return resource;
    }

    /**
     * @param defaultResourceReference
     * @param storage
     * @private
     */
    _changeDefaultResource(defaultResourceReference, storage) {

        if (!defaultResourceReference || !defaultResourceReference.id || !storage) {
            return;
        } else {
            this.clearLayer('backgrond');
        }

        console.log('TODO REFACTOR')
        /*
        storage.get(defaultResourceReference.id)
            .then((resource) => {
                // TODO how retrive data?
                let element = this._createPaperPlayerResource(resource, {}, 'backgrond');
                this.appendTimeslot('backgrond', element);
            });
            */
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
        for (let cont = 0; newValue.length > cont; cont++) {
            stringPolygon += `${newValue[cont].x}px ${newValue[cont].y}px`;
            if ((cont + 1) < newValue.length) {
                stringPolygon += ',';
            }
        }

        this.style.clipPath = `polygon(${stringPolygon})`;
    }
}
window.customElements.define('paper-player', PaperPlayer);
