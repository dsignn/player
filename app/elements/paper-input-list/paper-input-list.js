import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-input/paper-input';

/**
 * @class PaperInputList
 */
export class PaperInputList extends PolymerElement {

    static get template() {
        return html`
            <style>

                :host {
                    display: block;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                }
  
            </style>

            <div class="container">
                <paper-input id="list" name="[[name]]" label="[[label]]" on-keypress="addTag"></paper-input>
                <paper-chips id="chips" items="{{value}}" on-delete-item="deleteItem"></paper-chips>
            </div>
        `
    }

    static get properties() {
        return {

            name: {
                type: String
            },

            value: {
                notify: true,
                value: []
            }
        }
    }

    /**
     * @param {Event} evt 
     */
    addTag(evt) {
    
        if (evt.charCode === 13 && evt.target.value) {
            this.$.chips.add(evt.target.value);
            let event = new CustomEvent('list-value-changed', {detail: {value: this.value}});
            this.dispatchEvent(event);
            this.$.list.value = "";
       }
    }

    /**
     * @param {Event} evt 
     */
    deleteItem(evt) {
        let event = new CustomEvent('list-value-changed', {detail:  {value: this.value}});
        this.dispatchEvent(event);
    }
}

window.customElements.define('paper-input-list', PaperInputList);
