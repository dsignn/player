import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * @customElement
 * @polymer
 */
export class Test extends PolymerElement {

    static get template() {
        return html`
            <paper-autocomplete  on-autocomplete-selected="_select"></paper-autocomplete>
        `;
    }

    _select(evt) {
        evt.detail.target.suggestions; // = undefined
    }
}

