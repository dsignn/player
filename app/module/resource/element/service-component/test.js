import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-card/paper-card';

export class Test extends PolymerElement {

    static get template() {
        return html`
            <paper-card>
                SONO UN TEST
            </paper-card>
        `
    }
}

window.customElements.define('paper-test', Test);