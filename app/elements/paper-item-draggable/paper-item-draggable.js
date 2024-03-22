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
                    width: 5px;
                    height: 5px;
                    color: black;
                    padding: 4px;
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
                    background: white;
               }
   
            </style>
        `
    }

    static get properties () {
        return {
            
            maxX: {
                notify: true,
                type: Number,
            },

            maxY: {
                notify: true,
                type: Number,
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
        }
    }

    connectedCallback() { 
        super.connectedCallback();

        this.addEventListener('mousedown', this.filter.bind(this), false);
        window.addEventListener('mouseup', this.filter.bind(this), false);


    }

    _changeX(newValue, oldValue) {
        if (!newValue) {
            return
        }
        
        this.style.left = newValue + 'px';
    }

    _changeY(newValue, oldValue) {
        if (!newValue) {
            return
        }

        this.style.top = newValue + 'px';
    }

    filter(e) {
      
      
        let target = e.target;
        target.moving = true;
        e.clientX
          ? ((target.oldX = e.clientX), (target.oldY = e.clientY))
          : ((target.oldX = e.touches[0].clientX),
            (target.oldY = e.touches[0].clientY));
      
        document.onmousemove = dr;
        document.addEventListener("touchmove", dr, { passive: false });
       
        function dr(event) {
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
                case left < -7:
                    
                    console.log('ggggggggggggggggggggg');
                    break;
            }
            console.log('SUCAAAAAAAAAAAAAAAAAAA', left, top, this.maxX, this.maxY);

            //if(left < -7 || left >)
            target.style.left = left + "px";
            target.style.top = top + "px";
        }

        function endDrag() {
          target.moving = false;
        }
        target.onmouseup = endDrag;
        target.ontouchend = endDrag;
      }

}
window.customElements.define('paper-item-draggable', PaperItemDraggable);
