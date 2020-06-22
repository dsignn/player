
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
/**
 * Entry point for the module admin
 *
 * @customElement
 * @polymer
 */
class AdminIndex extends PolymerElement {
    static get template() {
        return html`
            admin
        `;
    }
}
window.customElements.define("admin-index", AdminIndex);
