import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-pages/iron-pages';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PaperIconResourceUpsert extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
          SS-HH
    `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {
          
        };
    }
}
window.customElements.define('paper-icon-resource-upsert', PaperIconResourceUpsert);