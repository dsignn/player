import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {DsignServiceInjectorElement} from "../../../../elements/service/dsign-service-injector";

/**
 * @customElement
 * @polymer
 */
class PaperPlayer extends DsignServiceInjectorElement {

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
            services : {
                value : {
                    "StorageContainerAggregate": {
                        "MonitorStorage":"MonitorStorage"
                    }
                }
            },

            nodeName : {
                type: String,
                readOnly: true,
                value: 'paperMonitor'
            },

            identifier: {
                type: String,
                reflectToAttribute : true,
            },

            defaultTimeslotId: {
                type: String,
                notify : true,
                observer: '_changeDefaultTimeslotId'
            },

            height: {
                type: Number,
                notify : true,
                observer: '_changeHeight'
            },

            width: {
                type: Number,
                notify : true,
                observer: '_changeWidth'
            },

            backgroundColor : {
                type: String,
                observer: '_changeBackgroundColor'
            },

            offsetX : {
                type: Number,
                value: 0,
                observer: '_changeOffsetX'
            },

            offsetY : {
                type: Number,
                value: 0,
                observer: '_changeOffsetY'
            },

            polygon : {
                type: String,
                observer: '_changePolygon'
            },


            timeslotDefault : {}
        }
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
}
window.customElements.define('paper-player', PaperPlayer);