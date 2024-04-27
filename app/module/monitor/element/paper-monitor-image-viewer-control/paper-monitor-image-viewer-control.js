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
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language';


var clickHandler = function (event) {
    
}

/**
 * @customElement
 * @polymer
 */
class PaperMonitorImageViewerControl extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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
                paper-input-color,
                paper-autocomplete {
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
                <paper-autocomplete
                    id="monitorAutocomplete"
                    label="{{localize('name-screen')}}"
                    text-property="name"
                    value-property="name"
                    on-autocomplete-change="searchMonitor"
                    on-autocomplete-selected="selectMonitor"
                    remote-source>
                    <template slot="autocomplete-custom-template">
                        ${autocompleteStyle}
                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                            <div index="[[index]]">
                                <div class="service-name">[[item.name]]</div>
                                <div class="service-description">[[item.description]]</div>
                            </div>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </template>
                    <paper-icon-button slot="suffix" on-tap="deSelectMonitor" icon="clear">
                    </paper-icon-button>
                </paper-autocomplete>
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
                <paper-input type="number" id="addXBtn" label="{{localize('point-x')}}" on-value-changed="toggleBtnAddPoint"></paper-input>
                <paper-input type="number" id="addYBtn" label="{{localize('point-y')}}" on-value-changed="toggleBtnAddPoint"></paper-input>
                <paper-button id="addPointBtn" on-tap="_addPoint" disabled>{{localize('add-point')}}</paper-button>
                <dom-repeat id="points" items="{{monitor.polygonPoints}}" as="point">
                    <template>  
                        <div class="points" index="{{index}}">
                            <paper-input name="x" label="X" value="[[point.x]]"></paper-input>
                            <paper-input name="y" label="Y" value="[[point.y]]"></paper-input>
                            <paper-icon-button icon="monitor:remove" class="circle" on-tap="_removePoint"></paper-icon-button>
                        </diV>
                   </template>
                </dom-repeat>
            </paper-card>
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
                }
            },

            searchMonitor: {
                type: Function,
            },

            rootElement: {

            },

            selectElement: {

            },

            rootMonitor: {

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
            },

            width: {
                notify: true,
                type: Number,
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
        this._attachEvent();
        
    }

    searchMonitor(evt) {
        
        let monitors = this.rootMonitor.getMonitors({nested:true});        
        let filter = monitors.filter(
            element => {
                return element.name.search(new RegExp(evt.detail.value.text, 'i')) > -1;
            }
        );

        evt.detail.target.suggestions(
            filter
        );
    }

    selectMonitor(evt){
       
        this.monitor = evt.detail.value;
        let ele = this.rootElement.getSelectedElement(this.monitor);
        if (ele) {
            this.selectElement = ele;

            this.externalChangePointHandler = this.externalChangePoint.bind(this);
            this.selectElement.addEventListener(
                'change-point',
                this.externalChangePointHandler,
                false
            );

            this.externalChangeHeightHandler =  this.externalChangeHeight.bind(this);
            this.selectElement.addEventListener(
                'change-height',
                this.externalChangeHeightHandler,
                false
            );

            this.externalChangeWidthHandler = this.externalChangeWidth.bind(this);
            this.selectElement.addEventListener(
                'change-width',
                this.externalChangeWidthHandler,
                false
            );
        }
    }

    deSelectMonitor(evt) {

        if (!this.monitor || !this.selectElement) {
            return;
        }
        console.log('deselect', this.selectElement);
       
        this.selectElement.removeEventListener(
            'change-width',
            this.externalChangeWidthHandler,
            false
        );

        this.selectElement.removeEventListener(
            'change-height',
            this.externalChangeHeightHandler,
            false
        );

        this.selectElement.removeEventListener(
            'change-point',
            this.externalChangePointHandler,
            false
        );

        this.monitor = null;
        this.selectElement = null;
        this.$.monitorAutocomplete.clear();
    }

    externalChangeHeight(evt) {
        console.log('height')
        this.monitor.height = evt.detail.height;
        this.notifyPath('monitor.height');
    }

    externalChangeWidth(evt) {
        console.log('width')
        this.monitor.width = evt.detail.width;
        this.notifyPath('monitor.width');
    }

    externalChangePoint(evt) {
        console.log('bbbbb')
        let index = evt.detail.index;
        let elements = this.shadowRoot.querySelectorAll('.points');
        let ele = null;

        for (let cont  = 0; elements.length > cont; cont++) {
            if (elements[cont].index == index) {
                ele = elements[cont];
                break;
            }
        }

        if (!ele) {
            console.warn('No element found')
            return;
        }

        ele.querySelector('paper-input[name=y]').value = evt.detail.y;
        ele.querySelector('paper-input[name=x]').value = evt.detail.x;
    }

    _attachEvent() {
        this.addEventListener(
            "change-background",
            (evt) => {
                if (this.selectElement) {
                   
                    this.selectElement.backgroundColor = evt.detail;
                }
            });

        this.addEventListener(
            "change-height",
            (evt) => {
                if (this.selectElement) {
                    
                    this.selectElement.height = evt.detail;
                }
            });
        
        this.addEventListener(
            "change-width",
            (evt) => {
                if (this.selectElement) {
                    
                    this.selectElement.width = evt.detail;
                }
            });

        this.addEventListener(
            "change-polygon",
            (evt) => {
                if (this.selectElement) {
                    
                    this.selectElement.renderPoint();
                }
            });
    }

    _changeMonitor(newValue) {
        if (!newValue) {
            return;
        }

        this._syncData();
    }

    _syncData() {

        this.height = this.monitor.height;
        this.width = this.monitor.width;
        this.backgroundColor = this.monitor.backgroundColor;
        this.polygon = this.monitor.polygonPoints;
    }

    changeColor(evt) {
        this._syncData();
    }

    _changeBackgroundColor(newValue, oldValue) {

        let event ;
        if (!newValue && newValue != oldValue) {
            event = new CustomEvent(
                'change-background', {
                    detail: 'trasparent'
                });
        } else {
            event = new CustomEvent(
                'change-background', {
                    detail: newValue
                });
        }

        console.log(event);
        this.dispatchEvent(event);
    }

    changeHeightEvtHandler(evt) {
        this.height = evt.target.value;
        let event = new CustomEvent(
            'change-height', {
                detail:  this.height
            });
        console.log(event);
        this.dispatchEvent(event);
    }

    changeWidthEvtHandler(evt) {
        this.width = evt.target.value;
        let event = new CustomEvent(
            'change-width', {
                detail:  this.width
            });
        console.log(event);
        this.dispatchEvent(event);
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

    _changeZoom(newValue, oldValue) {
        if (!newValue && newValue != oldValue) {
            return;
        }

        let event = new CustomEvent(
            'change-zoom', {
                detail:  {
                    zoom: this.zoom,
                    monitor: this.monitor
                }
            });
        console.log(event);
        this.dispatchEvent(event);
    }

    toggleBtnAddPoint(evt) {
        if (this.$.addXBtn.value && this.$.addYBtn.value) {
            this.$.addPointBtn.disabled = false;
        } else {
            this.$.addPointBtn.disabled = true;
        }
    }

    _changePolygon(newValue, oldValue) {

        if (!newValue && newValue != oldValue) {
            return;
        }
   
      
        let event = new CustomEvent(
            'change-polygon', {
                detail: this.polygon
            });
      

        this.$.points.render();
        this.dispatchEvent(event);
    }

    _addPoint(evt) {
      
        let point = {};
        point.x = this.$.addXBtn.value;
        point.y = this.$.addYBtn.value;
              
        //this.polygon.push(point);
        this.push('polygon', point);
        this.$.points.render();

        let event = new CustomEvent(
            'change-polygon', {
                detail: this.polygon
            });
        this.dispatchEvent(event);
            
        this.$.addXBtn.value = null;
        this.$.addYBtn.value = null;
    }

    _removePoint(evt) {
      
        this.splice('polygon', evt.target.parentElement.index, 1);
      
        this.$.points.render();
        let event = new CustomEvent(
            'change-polygon', {
                detail: this.polygon
            });
        this.dispatchEvent(event);
    }


 
}
window.customElements.define('paper-monitor-image-viewer-control', PaperMonitorImageViewerControl);