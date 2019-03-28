import {html} from '@polymer/polymer/polymer-element.js';
import {P3ELocalizeElement} from "../../../elements/localize/p3e-localize";
import {lang} from './language/language.js';

/**
 * @customElement
 * @polymer
 */
class WelcomeElement extends P3ELocalizeElement {
    static get template() {
        return html`
            <div class="container">
                {{localize('name', 'name', 'Mario')}}
            </div>
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }
}
window.customElements.define('welcome-element', WelcomeElement);

