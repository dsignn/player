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
                    position: relative;
                    height: 100%;

                }

                #image {
                    border: 1px solid black;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                #image:active {
                    width: 0;
                    height: 0;
                }

                #imageClip {
                    
                    position: absolute;
                    top: 0;
                    left: 0;
                    resize: both;
                    overflow: auto;
                    width:100%;
                    height: 100%;
            
                }

                #imageResize {
                    position: absolute;
                    z-index: blue;
                    top: 0;
                    left: 0;
                    resize: both;
                    overflow: auto;
                    width:100%;
                    height: 100%;
                    border: 1px solid black;
                }

                #scroll {
                    height: 20px;
                }

                .points {
                    display: flex;
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

                .zoom-action {
                    display: flex;
                    flex-direction: column; 
                    justify-content: space-between;
                    padding: 4px 8px 4px 4px;
                }

                paper-input {
                    width: 60px;
                }

                paper-input-color {
                    width: 120px;
                }

                paper-input,
                paper-input-color {
                    margin-right: 4px;
                }

                paper-input[name=x],
                paper-input[name=y],
                paper-input[name=zoom] {
                    width: 40px;
                }

                paper-input[disabled] {
                    --paper-input-container-disabled: {
                        opacity: 1;
                    }
                    
                    --paper-input-container-underline-disabled: {
                        border-bottom: 1px solid;
                    }
                }

                paper-icon-button.circle {
                    padding: 0;
                    border-radius: 50%;
                    background: var(--accent-color);
                    width: 24px;
                    height: 24px;
                    
                }

                .points paper-icon-button.circle {

                    margin-top: 28px;
                    margin-right: 4px;
                }
              
            </style>
            <paper-card class="action">
                <paper-input label="{{localize('height')}}" value="{{monitor.height}}" on-change="changeHeightEvtHandler"></paper-input>
                <paper-input label="{{localize('width')}}"  value="{{monitor.width}}" on-change="changeWidthEvtHandler"></paper-input>
                <paper-input-color id="backgroundColor" label="{{localize('bg-color')}}" value="{{monitor.backgroundColor}}" on-change-value="changeColor"></paper-input-color>
                <paper-input name="zoom" label="{{localize('zoom')}}" value="{{zoom}}" disabled>
                    <div slot="suffix">%</div>
                </paper-input>       
                <div class="zoom-action">
                    <paper-icon-button icon="monitor:add" on-tap="zoomIn" class="circle"></paper-icon-button>
                    <paper-icon-button icon="monitor:remove" on-tap="zoomOut" class="circle"></paper-icon-button>
                </div>
                <paper-input type="number" id="addXBtn" label="{{localize('point-x')}}" on-value-changed="changeAddPoint"></paper-input>
                <paper-input type="number" id="addYBtn" label="{{localize('point-y')}}" on-value-changed="changeAddPoint"></paper-input>
                <paper-button id="addPointBtn" on-tap="_addPoint" disabled>{{localize('add-point')}}</paper-button>
                <dom-repeat items="{{monitor.polygonPoints}}" as="point">
                    <template>  
                        <div class="points" index="{{index}}">
                            <paper-input name="x" label="X" value="[[point.x]]"></paper-input>
                            <paper-input name="y" label="Y" value="[[point.y]]"></paper-input>
                            <paper-icon-button icon="monitor:remove" class="circle" on-tap="_removePoint"></paper-icon-button>
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
                <div id="imageClip">
                </div>
                <div id="imageResize">
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
          
            this.width = parseInt(this.$.imageResize.style.width.replace('px',''));   
            this.height = parseInt(this.$.imageResize.style.height.replace('px',''));
        });
          
      
        observer.observe(this.$.imageResize);
       
        this.resizeImageContainer();
        window.addEventListener("resize", this.resizeImageContainer.bind(this));
    }

    changeAddPoint(evt) {
        if (this.$.addXBtn.value && this.$.addYBtn.value) {
            this.$.addPointBtn.disabled = false;
        } else {
            this.$.addPointBtn.disabled = true;
        }
    }

    resizeImageContainer(evt) {
        let dataContainer = this.$['image-container'].getBoundingClientRect();
        let dataBody = document.body.getBoundingClientRect();

        if (dataBody.height && dataContainer.top) {
            let calcHeight = dataBody.height - dataContainer.top - 10;
        
            this.$['image-container'].style.height = calcHeight + 'px';
        }
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
        this.$.imageClip.style.height =  newValue + 'px';
        this.$.imageResize.style.height =  newValue + 'px';
        
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
        this.$.imageClip.style.width =  newValue + 'px';
        this.$.imageResize.style.width =  newValue + 'px';
        this.$.scroll.style.width =  (newValue  + 9) + 'px';
    }

    changeWidthEvtHandler(evt) {
        this.width = evt.target.value;
    }

    _changeBackgroundColor(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }

        this._computeBackground();
    }

    _computeBackground() {

        let background = this.backgroundColor;
        if(!this.backgroundColor) {
            background = 'transparent';
        }

        if(this.polygon.length > 0) {
            this.$.image.style.backgroundColor = 'transparent';
            this.$.imageClip.style.backgroundColor = background;
        } else {
            this.$.image.style.backgroundColor = background;
            this.$.imageClip.style.backgroundColor = 'transparent';
        }
    }

    _changePolygon(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }

        this._computePolygon(newValue);
    }

    _computePolygon(polygon) {

        let stringPolygon = '';
        for (let cont = 0; polygon.length > cont; cont++) {
            stringPolygon += `${polygon[cont].x}px ${polygon[cont].y}px`;
            if ((cont + 1) < polygon.length) {
                stringPolygon += ',';
            }
        }

        this.$.imageClip.style.clipPath = `polygon(${stringPolygon})`;
    }

    changePoint(evt) {
       
        let nodes = this.shadowRoot.querySelectorAll('.points');
        let ele;
        let index;
        for (let cont = 0; cont <= nodes.length; cont++ ) {
            if (nodes[cont].index === evt.target.index) {
                ele = nodes[cont];
                index = cont;
                break;
            }
        }
      
       
        ele.querySelector('paper-input[name=x]').value = evt.detail.x;
        ele.querySelector('paper-input[name=y]').value = evt.detail.y;
        this.monitor.polygonPoints[index].x = evt.detail.x;
        this.monitor.polygonPoints[index].y = evt.detail.y;
        this.polygon = this.monitor.polygonPoints;
    

        this._computePolygon(this.monitor.polygonPoints);
    }

    _addPoint(evt) {
      
        let point = {};
        point.x = this.$.addXBtn.value;
        point.y = this.$.addYBtn.value;
        
       // this.notifyPath('monitor.pol');
        this.push('monitor.polygonPoints', point);
        this.polygon = this.monitor.polygonPoints;
        this._computePolygon(this.monitor.polygonPoints);

        this.$.addXBtn.value = null;
        this.$.addYBtn.value = null;
    }

    _removePoint(evt) {
      

        this.splice('monitor.polygonPoints', evt.target.parentElement.index, 1);
        this.polygon = this.monitor.polygonPoints;
        this._computePolygon(this.monitor.polygonPoints);
        this._computeBackground()
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