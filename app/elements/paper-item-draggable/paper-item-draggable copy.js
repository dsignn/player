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
                    display:block;
                    position; relative;
                    height: 10px;
                    width: 10px;
                    border-radius: 50%;
                    background: black;
                    border: 1px solid white;
                    position: absolute;
               }
   
            </style>
        `
    }

    static get properties () {
        return {
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

        this.addEventListener('mousedown', this.mouseDown.bind(this), false);
        window.addEventListener('mouseup', this.mouseUp.bind(this), false);
/*
        this.setAttribute('draggable', 'true');
        this.addEventListener('dragstart', this._dragstart.bind(this));
        this.addEventListener('dragend', this._dragend.bind(this));
        this.addEventListener('dragenter', this._dragenter.bind(this));
        this.addEventListener('drag', this._drag.bind(this));
        this.addEventListener('drop', this._drop.bind(this));
        this.addEventListener('track', this._drop.bind(this));
        this.addEventListener('dragover', this._dragover.bind(this));
        this.addEventListener('dragleave', this._dragleave.bind(this));
    */

    }

    mouseDown(e) {
        window.addEventListener('mousemove', move, true);
    }

    mouseUp() {
        window.removeEventListener('mousemove', move, true);
    }

    move(e) {
        m.style.top = e.clientY + 'px';
        m.style.left = e.clientX + 'px';
    };
    

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

    _dragstart(evt) {
        console.log('dragstart');
    }

    _dragend(evt) {
        console.log('dragend');
    }

    _dragenter(evt) {
        console.log('dragenter');
    }

    _drag(evt) {
        console.log('drag', evt.detail);
    }

    _drop(evt) {
        evt.preventDefault();
        console.log('drop', evt.detail);
    }

    _dragover(evt) {
        console.log('drop');
    }

    _dragleave(evt) {
        console.log('dragleave');
    }

}
window.customElements.define('paper-item-draggable', PaperItemDraggable);
