import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import './element/welcome-element';

/**
 * @customElement
 * @polymer
 */
class HomeIndex extends PolymerElement {
    static get template() {
        return html`
           <welcome-element></welcome-element>
        `;
    }
}
window.customElements.define('welcome-index', HomeIndex);

