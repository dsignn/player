import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
/**
 * @customElement
 * @polymer
 */
class DashboardIndex extends PolymerElement {
    static get template() {
        return html`
           <div>dashboard index</div>
        `;
    }
}
window.customElements.define('dashboard-index', DashboardIndex);