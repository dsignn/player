import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-card/paper-card';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@fluidnext-polymer/paper-input-color/paper-input-color'
import '@fluidnext-polymer/paper-input-color/icons/paper-input-color-icons'
import '../../../../elements/paper-input-points/paper-input-points';
import {flexStyle} from '../../../../style/layout-style';
import  '../../../../elements/paper-item-draggable/paper-item-draggable';
import '@fluidnext-polymer/paper-chip/paper-chip';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PaperMonitorImageViewer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle}
            <style >
                :host {
                    display: block;

                   
                }

                paper-menu-button {
                    padding: 0;
                }
                
                #scroll-container {
                    overflow-x: auto;
                    overflow-y: hidden;
                    display: block;                   
                }

                #image-container {
                    overflow-x: auto;
                    overflow-y: auto;
                    display: block;   
                }

                #image {
                    border: 1px solid black;
                    resize: both;
                    overflow: auto;
                    position: relative;
                }

                #imageClip {
                    
                    position: absolute;
                    width:100%;
                    height: 100%;
                }

                #scroll {
                    height: 20px;
                }

                .action {
                    display: flex;
                    margin-top: 4px;
                    padding: 6px 12px;
                }

                .zoom {
                    padding: 0 8px ;
                    width: 50px;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                }

                paper-input {
                    width: 80px;
                }

                paper-input,
                paper-input-color {
                    margin-right: 4px;
                }

                paper-icon-button {
                    margin-top: 34px;
                }
              
            </style>
            <paper-card class="action">
                <paper-input label="{{localize('height')}}" value="{{monitor.height}}" on-change="changeHeightEvtHandler"></paper-input>
                <paper-input label="{{localize('width')}}"  value="{{monitor.width}}" on-change="changeWidthEvtHandler"></paper-input>
                <paper-input-color id="backgroundColor" label="{{localize('bg-color')}}" value="{{monitor.backgroundColor}}" on-change-value="changeColor"></paper-input-color>
                <div class="zoom">{{zoom}}%</div>
                <paper-icon-button icon="monitor:add" on-tap="zoomIn"></paper-icon-button>
                <paper-icon-button icon="monitor:remove" on-tap="zoomOut"> </paper-icon-button>
                <dom-repeat items="{{monitor.polygonPoints}}" as="point">
                    <template>  
                        <div class="points" index="{{index}}">
                            <paper-input name="x" label="x" value="[[point.x]]"></paper-input>
                            <paper-input name="y" label="y" value="[[point.y]]"></paper-input>
                        </diV>
                   </template>
                </dom-repeat>
            </paper-card>
            <div id="scroll-container">
                <div id="scroll"></div>
            </div>
            <div id="image-container">
                <div id="image">
                    <dom-repeat items="{{monitor.polygonPoints}}" as="point">
                        <template>
                            <paper-item-draggable 
                                index={{index}}
                                x="{{point.x}}" 
                                y="{{point.y}}"
                                max-x="{{monitor.width}}"
                                max-y="{{monitor.height}}"
                                on-change-points="changePoint">
                            </paper-item-draggable>
                        </template>
                    </dom-repeat>
                </div>
            </div>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }


    static get properties () {
        return {

            /**
             * @object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _resourceStorage: "ResourceStorage"
                    },
                    EntityContainerAggregate: {
                        _entityReference : "EntityReference"
                    }
                }
            },

            /**
             * @type object
             */
            monitor: {
                observer: '_changeMonitor',
            },

            zoom: {
                notify: true,
                type: Number,
                value: 100,
                observer: '_changeZoom',
            },

            height: {
                notify: true,
                type: Number,
                observer: '_changeHeight',
            },

            width: {
                notify: true,
                type: Number,
                observer: '_changeWidth',
            },

            backgroundColor: {
                notify: true,
                type: String,
                observer: '_changeBackgroundColor',
            },

            polygon: {
                notify: true,
                type: Array,
                observer: '_changePolygon',
            },

            x: {
                notify: true,
                type: Number,
            },

            y: {
                notify: true,
                type: Number,
            },
        };
    }

    connectedCallback() { 
        super.connectedCallback();
      
        this.$['scroll-container'].addEventListener("scroll", (event) => {
           this.$['image-container'].scrollLeft = event.target.scrollLeft;
        });
        
        let observer = new ResizeObserver((mutations) => {
            this.width = parseInt(this.$.image.style.width.replace('px',''));   
            this.height = parseInt(this.$.image.style.height.replace('px',''));
        });
          
      
        observer.observe(this.$.image);
    }

    zoomOut() {
        if (this.zoom > 5) {
            this.zoom = this.zoom -5;
        }
    }

    zoomIn()   {
        if (this.zoom < 100) {
            this.zoom = this.zoom +5;
        }
    }

    _changeMonitor(newValue) {
        if (!newValue) {
            return;
        }

        this._syncData();
    }

    changeColor(evt) {
        this._syncData();
    }

    _changeHeight(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }

        this.monitor.height = newValue;
        this.notifyPath('monitor.height');
        this.$.image.style.height =  newValue + 'px';
    }

    changeHeightEvtHandler(evt) {
        this.height = evt.target.value;
    }

    _changeWidth(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }

        this.monitor.width = newValue;
        this.notifyPath('monitor.width');
        this.$.image.style.width =  newValue + 'px';
        this.$.scroll.style.width =  (newValue  + 9) + 'px';
    }

    changeWidthEvtHandler(evt) {
        this.width = evt.target.value;
    }

    _changeBackgroundColor(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            this.$.image.style.backgroundColor = 'transparent';
            return;
        }

        this.$.image.style.backgroundColor = newValue;
    }

    _changePolygon(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }
/*
        let stringPolygon = '';
        for (let cont = 0; newValue.length > cont; cont++) {
            stringPolygon += `${newValue[cont].x}px ${newValue[cont].y}px`;
            if ((cont + 1) < newValue.length) {
                stringPolygon += ',';
            }
        }

        this.$.image.style.clipPath = `polygon(${stringPolygon})`;
        console.log('_changePolygon', newValue)
        */
       console.log('change polygon');
    }

    changePoint(evt) {
       
        let nodes = this.shadowRoot.querySelectorAll('.points');
        let ele;
        for (let cont = 0; cont <= nodes.length; cont++ ) {
            if (nodes[cont].index === evt.target.index) {
                ele = nodes[cont];
                break;
            }
        }
        console.log('CHANGE', ele, evt.detail.x, evt.detail.y, evt.target.index)
       
        ele.querySelector('paper-input[name=x]').value = evt.detail.x;
        ele.querySelector('paper-input[name=y]').value = evt.detail.y;
        this.polygon = this.monitor.polygonPoints
    }

    addPointEvtHandler(evt) {
      
        this.notifyPath('monitor.pol');
    }

    _changeZoom(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }

        this.$['scroll-container'].style.zoom = newValue + '%';
        this.$['image-container'].style.zoom = newValue + '%';

        let event = new CustomEvent("changezoom", {
            detail: this.zoom,
        });

        this.dispatchEvent(event);
    }

    _syncData() {

        this.height = this.monitor.height;
        this.width = this.monitor.width;
        this.backgroundColor = this.monitor.backgroundColor;
        this.polygon = this.monitor.polygonPoints;
    }
}
window.customElements.define('paper-monitor-image-viewer', PaperMonitorImageViewer);