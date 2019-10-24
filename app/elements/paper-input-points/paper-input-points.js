import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input';
/**
 * @customElement
 * @polymer
 */
class PaperInputPoints extends PolymerElement {


    static get template() {
        return html`
             <style>
                #container {
                    display: block;
                    height: 100%;
                    width: 100%;
                    position: relative;
                }
    
            </style>
            <div id="container">
                <paper-input name="x" type="number" label="{{labelX}}"></paper-input>
                <paper-input name="y" type="number" label="{{labelY}}"></paper-input>
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
                value: []
            },

            labelX: {
                type: String
            },

            labelY: {
                type: String
            }
        }
    }
}
window.customElements.define('paper-input-points', PaperInputPoints);
