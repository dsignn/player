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
                    display: block !important;
                    position: absolute;
                    background: red;
                }               

                #image {
                    position: absolute;
                    top: 0;
                    left: 0;
                }
                ;
                #image:active {
                    width: 0;
                    height: 0;
                }

                #imageClip {
                    position: absolute;
                    top: 0;
                    left: 0;
                    overflow: auto;
                    width:100%;
                    height: 100%;
            
                }

                paper-menu-button {
                    padding: 0;
                }

                #viewer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                    width:100%;
                    height: 100%;
                }

                #imageResize {
                    position: absolute;
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
                paper-input[name=y] {
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
                <div id="image">
                    <dom-repeat id="points" items="{{monitor.polygonPoints}}" as="point">
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
                    <dom-repeat id="menu" items="{{monitor.monitors}}" as="monitor">
                        <template>
                            <paper-monitor-image-viewer monitor="{{monitor}}"></paper-monitor-image-viewer>
                        </template>
                    </dom-repeat>
                </div>       `
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

            isRoute: {
                value: false,
                type: Boolean,
                observer: '_changeIsRoute'
            },

            /**
             * @type object
             */
            monitor: {
                observer: '_changeMonitor',
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
            },

            polygon: {
                notify: true,
                type: Array,
                value: []
            },

            x: {
                notify: true,
                type: Number,
                observer: '_changeX',
            },

            y: {
                notify: true,
                type: Number,
                observer: '_changeY',
            },
        };
    }

    static get observers() {
        return [
            'changeBgPolygon(backgroundColor, polygon)'
        ]
    }

    connectedCallback() { 
        super.connectedCallback();

        if(!this.isRoute) {
            this.classList.add("draggable");
        }
    
        
        let observer = new ResizeObserver((mutations) => {
          
            this.width = parseInt(this.$.imageResize.style.width.replace('px',''));   
            this.height = parseInt(this.$.imageResize.style.height.replace('px',''));
        });
          
      
        observer.observe(this.$.imageResize);
        this.onmousedown = this.filter;
        //NOTICE THIS 👇
        this.ontouchstart = this.filter;
    }

    getSelectedElement(monitor) {

        let elements = this.getAllPaperViewer();
        let selected = null;

        for(let cont = 0; elements.length > cont; cont++) {
            if(elements[cont].monitor.id === monitor.id) {
                selected = elements[cont];   
                break
            }
        }
        return selected;
    }

    getAllPaperViewer(element, elements) {
       
        if (!elements) {
            elements = [];
        }

        if (!element) {
            element = this;
        }

        elements.push(element);     

        let subElements = element.shadowRoot.querySelectorAll('paper-monitor-image-viewer');
        if (subElements.length > 0) {
            for (let cont = 0; subElements.length > cont; cont++) {
                elements.concat(this.getAllPaperViewer(subElements[cont], elements));
            }
        } 
        return elements;
    }

    _changeIsRoute(newValue) {
        if (newValue === false) {
            this.$.imageResize.style.border = 'none';
        } else {
            this.$.imageResize.style.border = 'border: 1px solid black;';
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

        let event = new CustomEvent(
            'change-height', {
                detail: {
                    height: newValue
                }
            });
        
        this.dispatchEvent(event);
        
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

        let event = new CustomEvent(
            'change-width', {
                detail: {
                    width: newValue
                }
            });
        
        this.dispatchEvent(event);
    }

    _changeX(newValue, oldValue) {
        if (!newValue && newValue != oldValue && newValue != 0) {
            return;
        }

        this.monitor.offsetX = newValue;
        this.style.left = newValue + 'px';

        let event = new CustomEvent(
            'change-x', {
                detail: {
                    x: newValue
                }
            });
        
        this.dispatchEvent(event);
    }

    _changeY(newValue, oldValue) {
        if (!newValue && newValue != oldValue && newValue != 0) {
            return;
        }

        this.monitor.offsetY = newValue;
        this.style.top = newValue + 'px';

        let event = new CustomEvent(
            'change-y', {
                detail: {
                    y: newValue
                }
            });
        
        this.dispatchEvent(event);
    }

    changeWidthEvtHandler(evt) {
        this.width = evt.target.value;
    }

    renderPoint(){
        this.$.points.render();
        
        this._computePolygon();
        this._computeBackground();
    }

    changeBgPolygon(polygon, backgroundColor) {
        if(!polygon || !Array.isArray(backgroundColor)) {
            return;
        }

        this._computePolygon();
        this._computeBackground();
    }

    _computeBackground() {

        let background = this.backgroundColor;
        if(!this.backgroundColor) {
            background = 'transparent';
        }
        this.monitor.backgroundColor = this.backgroundColor;
        if(this.polygon.length > 0) {
            this.$.image.style.backgroundColor = 'transparent';
            this.$.imageClip.style.backgroundColor = background;
        } else {
            this.$.image.style.backgroundColor = background;
            this.$.imageClip.style.backgroundColor = 'transparent';
        }
    }

    _computePolygon() {

        let stringPolygon = '';
        for (let cont = 0; this.polygon.length > cont; cont++) {
            stringPolygon += `${this.polygon[cont].x}px ${this.polygon[cont].y}px`;
            if ((cont + 1) < this.polygon.length) {
                stringPolygon += ',';
            }
        }

        this.$.imageClip.style.clipPath = `polygon(${stringPolygon})`;
    }

    changePoint(evt) {
       
        let index = evt.target.index;
        
        this.monitor.polygonPoints[index].x = evt.detail.x;
        this.monitor.polygonPoints[index].y = evt.detail.y;
        this.polygon = this.monitor.polygonPoints;
    
        let event = new CustomEvent(
            'change-point', {
                detail: {
                    x: evt.detail.x,
                    y: evt.detail.y,
                    index: index
                }
            });
        
        this.dispatchEvent(event);
        this._computePolygon();
    }

    _syncData() {

        this.height = this.monitor.height;
        this.width = this.monitor.width;
        this.backgroundColor = this.monitor.backgroundColor;
        this.polygon = this.monitor.polygonPoints;
        if(!this.isRoute) {
            this.x = this.monitor.offsetX;
            this.y = this.monitor.offsetY;
        }
        
    }


    filter(e) {
        let target = e.target;
    
        if (!target.classList.contains("draggable")) {
          return;
        }
      
        target.moving = true;
      
        //NOTICE THIS 👇 Check if Mouse events exist on users' device
        if (e.clientX) {
          target.oldX = e.clientX; // If they exist then use Mouse input
          target.oldY = e.clientY;
        } else {
          target.oldX = e.touches[0].clientX; // Otherwise use touch input
          target.oldY = e.touches[0].clientY;
        }
        //NOTICE THIS 👆 Since there can be multiple touches, you need to mention which touch to look for, we are using the first touch only in this case
      
        target.oldLeft = window.getComputedStyle(target).getPropertyValue('left').split('px')[0] * 1;
        target.oldTop = window.getComputedStyle(target).getPropertyValue('top').split('px')[0] * 1;
      
        document.onmousemove = dr;
        //NOTICE THIS 👇
        document.ontouchmove = dr;
        //NOTICE THIS 👆
      
        function dr(event) {
          event.preventDefault();
      
          if (!target.moving) {
            return;
          }
          //NOTICE THIS 👇
          if (event.clientX) {
            target.distX = event.clientX - target.oldX;
            target.distY = event.clientY - target.oldY;
          } else {
            target.distX = event.touches[0].clientX - target.oldX;
            target.distY = event.touches[0].clientY - target.oldY;
          }
          //NOTICE THIS 👆

          let left = target.oldLeft + target.distX;
          let top = target.oldTop + target.distY;

          target.x = left;
          target.y = top;
         
          target.style.left = left + "px";
          target.style.top = top + "px";
        }
      
        function endDrag() {
          target.moving = false;
        }
        target.onmouseup = endDrag;
        //NOTICE THIS 👇
        target.ontouchend = endDrag;
        //NOTICE THIS 👆
      }
}
window.customElements.define('paper-monitor-image-viewer', PaperMonitorImageViewer);

/**
 * EVENT TO MOVE 
 

 function filter(e) {
    let target = e.target;
  console.log('ddddddddddddddddddd');
    if (!target.classList.contains("draggable")) {
      return;
    }
  
    target.moving = true;
  
    //NOTICE THIS 👇 Check if Mouse events exist on users' device
    if (e.clientX) {
      target.oldX = e.clientX; // If they exist then use Mouse input
      target.oldY = e.clientY;
    } else {
      target.oldX = e.touches[0].clientX; // Otherwise use touch input
      target.oldY = e.touches[0].clientY;
    }
    //NOTICE THIS 👆 Since there can be multiple touches, you need to mention which touch to look for, we are using the first touch only in this case
  
    target.oldLeft = window.getComputedStyle(target).getPropertyValue('left').split('px')[0] * 1;
    target.oldTop = window.getComputedStyle(target).getPropertyValue('top').split('px')[0] * 1;
  
    document.onmousemove = dr;
    //NOTICE THIS 👇
    document.ontouchmove = dr;
    //NOTICE THIS 👆
  
    function dr(event) {
      event.preventDefault();
  
      if (!target.moving) {
        return;
      }
      //NOTICE THIS 👇
      if (event.clientX) {
        target.distX = event.clientX - target.oldX;
        target.distY = event.clientY - target.oldY;
      } else {
        target.distX = event.touches[0].clientX - target.oldX;
        target.distY = event.touches[0].clientY - target.oldY;
      }
      //NOTICE THIS 👆
  
      target.style.left = target.oldLeft + target.distX + "px";
      target.style.top = target.oldTop + target.distY + "px";
    }
  
    function endDrag() {
      target.moving = false;
    }
    target.onmouseup = endDrag;
    //NOTICE THIS 👇
    target.ontouchend = endDrag;
    //NOTICE THIS 👆
  }
  console.log('DIO CANE');
  document.onmousedown = filter;
  //NOTICE THIS 👇
  document.ontouchstart = filter;
  //NOTICE THIS 👆
  */