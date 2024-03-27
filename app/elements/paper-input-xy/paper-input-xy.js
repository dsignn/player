import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import '@fluidnext-polymer/paper-chip/paper-chips';

/**
 * @customElement
 * @polymer
 */
class PaperInputXy extends PolymerElement {


    static get template() {
        return html`
             <style>
                #container {
                    height: 100%;
                    width: 100%;
                }

                .flex {
                    display: flex;
                }
        
                .vertical {
                    display: flex;
                    flex-direction: column;
                }        
        
                .horizontal {
                    display: flex;
                    flex-direction: row;
                }

                .divider {
                    width: 8px;
                }
    
            </style>
            <div>
                <div id="container">
                    <paper-input name="x" type="number" label="{{labelX}}" value="{{x}}"></paper-input>
                    <div class="divider"></div>
                    <paper-input name="y" type="number" label="{{labelY}}" value="{{y}}"></paper-input>
                </div>
                <paper-button id="add" disabled="{{disabled}}" on-tap="addPoint">{{save}}</paper-button>
               
            </div>
        `
    }

    static get properties () {
        return {

            /**
             * @type object
             */
            value: {
                type: Array,
                notify: true,
                value: () => { return []; }
            },

            labelX: {
                type: String,
                notify: true,
                value: 'X axis'
            },

            labelY: {
                type: String,
                notify: true,
                value: 'Y axis'
            },

            save: {
                type: String,
                notify: true,
                value: 'Add'
            },

            x: {
                type: Number,
                notify: true,
                observer: 'xChange'
            },

            y: {
                type: Number,
                notify: true,
                observer: 'yChange'
            },

            disabled: {
                type: Boolean,
                readOnly: true,
                value: true
            },            
        }
    }

    computePointData(item) {
        return `${item.x} - ${item.y}`;
    }

    /**
     * @param {CustomEvent} evt
     */
    addPoint(evt) {

        let point = {x: parseInt(this.x), y: parseInt(this.y)};
       
        this.dispatchEvent(new CustomEvent('add-point', {detail:point}));
        this.push('value', point);
        this.x = '';
        this.y = '';
    }

    /**
     * @param newValue
     */
    yChange(newValue) {
        if(!newValue) {
            this._setDisabled(true);
            return;
        }

        this._setDisabled(this._computeIsDisabled());
    }
    /**
     * @param newValue
     */
    xChange(newValue) {
        if(!newValue) {
            this._setDisabled(true);
            return;
        }

        this._setDisabled(this._computeIsDisabled());
    }

    /**
     * @param newValue
     */
    positionChange(newValue) {
        if(!newValue) {
            return;
        }

        this.$.container.className = '';
        this.$.container.classList.add(newValue === 'horizontal' ? 'horizontal' : 'vertical');
    }

    /**
     * @param className
     * @private
     */
    _setChildClass(className) {
        for (let i = 0; i <  this.$.container.children.length; i++) {

            let classList =   this.$.container.children[i].classList;
            while (classList.length > 0) {
                classList.remove(classList.item(0));
            }

            this.$.container.children[i].className = className;
        }
    }



    /**
     * @returns {boolean}
     * @private
     */
    _computeIsDisabled() {
        return !((!!this.x && parseInt(this.x) >= 0) && (!!this.y && parseInt(this.y) >= 0));
    }

    clear() {
        this.x = null;
        this.y = null;
        this.value = [];
    }
}
window.customElements.define('paper-input-xy', PaperInputXy);