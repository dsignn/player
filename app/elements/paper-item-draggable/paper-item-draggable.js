import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import '@fluidnext-polymer/paper-chip/paper-chips';

/**
 * @customElement
 * @polymer
 */
class PaperItemDraggable extends PolymerElement {


    static get template() {
        return html`
             <style>
               :host {
                    width: 16px;
                    height: 16px;
                    color: black;
                    box-sizing: border-box;
                    font-size: 25px;
                    text-align: center;
                    display: flex;
                    align-items: center;
                    border: 2px solid black;
                    border-radius: 50%;
                    cursor: move;
                    user-select: none;
                    position: absolute;
                    z-index:100;
                    background: white;
               }
   
               #draggable {
                width: 100%;
                height: 100%;
               }

              paper-tooltip {
                --paper-tooltip : {
                 background-color: var(--default-primary-color);
                    background:  var(--default-primary-color);
                    font-size: 20px;
                    border-radius: 4px;
                    width: max-content;
                }
              }

              .item {
                padding: 2px 6px;
              }
            </style>
            <div id="draggable"></div>
            <paper-tooltip for="draggable" position="bottom">
                <div class="item">X : {{x}}</div>
                <div class="item">Y : {{y}}</div>
            </paper-tooltip>
        `
    }

    static get properties () {
        return {
            
            maxX: {
                notify: true,
                type: Number,
                value: -1
            },

            maxY: {
                notify: true,
                type: Number,
                value: -1
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

            width: {
                notify: true,
                type: Number,
                value: 16
            },

            height: {
                notify: true,
                type: Number,
                value: 16
            },

        }
    }

    connectedCallback() { 
        super.connectedCallback();

        this.addEventListener('mousedown', this.filter.bind(this), false);
        window.addEventListener('mouseup', this.filter.bind(this), false);

        this.style.width = this.width + 'px';
        this.style.height = this.height + 'px';
        console.log('cccccc', this.height, this.width)
        this.style.left = (this.x - (this.height  / 2)) + 'px';
        this.style.top = (this.y - (this.width / 2)) + 'px';

    }

    _changeX(newValue, oldValue) {
        if (newValue  === null || newValue === undefined) {
            return
        }
        console.log('X', newValue, this.offsetWidth, this)
        this.style.left = (newValue - (this.offsetWidth / 2)) + 'px';
    }

    _changeY(newValue, oldValue) {
        if (newValue === null || newValue === undefined) {
            return
        }
        console.log('Y', newValue, this.offsetHeight, this)
        this.style.top = (newValue - (this.offsetHeight / 2)) + 'px';
    }

    filter(e) {
      
        let target = e.target;
        if (target.tagName !=   'PAPER-ITEM-DRAGGABLE') { 
            return;
        }
        
        target.moving = true;
        e.clientX
          ? ((target.oldX = e.clientX), (target.oldY = e.clientY))
          : ((target.oldX = e.touches[0].clientX),
            (target.oldY = e.touches[0].clientY));
      
        let dr = function(event) {
          event.preventDefault();
          if (!target.moving) {
            return;
          }
          e.clientX
            ? ((target.distX = event.clientX - target.oldX),
              (target.distY = event.clientY - target.oldY),
              (target.oldX = event.clientX),
              (target.oldY = event.clientY))
            : ((target.distX = event.touches[0].clientX - target.oldX),
              (target.distY = event.touches[0].clientY - target.oldY),
              (target.oldX = event.touches[0].clientX),
              (target.oldY = event.touches[0].clientY));
         
         
            let left = target.offsetLeft + target.distX;
            let top = target.offsetTop + target.distY;

            switch(true) {
                case left < - (target.offsetWidth / 2):
                    return;
                case this.maxX > 0 && left > (this.maxX - (target.offsetWidth / 2)):  
                    return;
                case top < - (target.offsetHeight / 2):
                    return;
                case this.maxY > 0 && top > (this.maxY - (target.offsetHeight / 2)):     
                    return;
            }
      
            target.style.left = left + "px";
            target.style.top = top + "px";
            
            let evt = new CustomEvent('change-points', {
                detail: {
                    x: left + (target.offsetWidth / 2),
                    y: top + (target.offsetHeight / 2)
                }
            });

            this.dispatchEvent(evt);

        }.bind(this);

        document.onmousemove = dr;
        document.addEventListener("touchmove", dr, { passive: false });

        function endDrag(evt) {
            if (target.tagName ==   'PAPER-ITEM-DRAGGABLE') {
                target.x  = parseInt(target.style.left.replace("px", "")) + (target.offsetWidth / 2);
                target.y = parseInt(target.style.top.replace("px", "")) + (target.offsetHeight / 2);
            }
          
            target.moving = false;
        }

        window.addEventListener('mouseup', endDrag);        
    }
}
window.customElements.define('paper-item-draggable', PaperItemDraggable);
