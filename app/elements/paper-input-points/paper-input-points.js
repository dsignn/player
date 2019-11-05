import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';
import '@fluidnext-polymer/paper-chip/paper-chips';
/**
 * @customElement
 * @polymer
 */
class PaperInputPoints extends PolymerElement {


    static get template() {
        return html`
             <style>
                #container {
                    height: 100%;
                    width: 100%;
                }
        
                .vertical {
                    display: flex;
                    flex-direction: column;
                }        
        
                .horizontal {
                    display: flex;
                    flex-direction: row;
                }
                
                .padding-left-6 {
                    padding-left: 6px;
                }
    
            </style>
            <div id="container">
                <paper-input name="x" type="number" label="{{labelX}}" value="{{x}}"></paper-input>
                <paper-input name="y" type="number" label="{{labelY}}" value="{{y}}"></paper-input>
                <paper-button id="add" disabled="{{disabled}}" on-tap="addPoint">{{save}}</paper-button>
                <paper-chips text-property="x" items="{{value}}" compute-data-fn="{{computePointData}}"></paper-chips>
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
                value: () => { return []; }
            },

            labelX: {
                type: String,
                value: 'Y axis'
            },

            labelY: {
                type: String,
                value: 'X axis'
            },

            save: {
                type: String,
                value: 'Add'
            },

            x: {
                observer: 'xChange'
            },

            y: {
                observer: 'yChange'
            },

            disabled: {
                type: Boolean,
                readOnly: true,
                value: true
            },

            position: {
                value: "vertical",
                observer: 'positionChange'
            }
        }
    }

    computePointData(item) {
        return `${item.x} - ${item.y}`;
    }

    /**
     * @param {CustomEvent} evt
     */
    addPoint(evt) {
        this.push('value', {x: parseInt(this.x), y: parseInt(this.y)});
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
        this._setChildClass(newValue === 'horizontal' ? 'padding-left-6' : '')
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
window.customElements.define('paper-input-points', PaperInputPoints);
