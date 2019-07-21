import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import {lang} from "./language/language.js";
import {ServiceInjectorMixin} from "../mixin/service/injector-mixin"
import {LocalizeMixin} from "../mixin/localize/localize-mixin";

/**
 * @customElement
 * @polymer
 */
export class PaperSelectLanguage extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <paper-menu-button on-iron-select="_selectLanguage">
                <div slot="dropdown-trigger">{{localize(language)}}</div>
                <paper-listbox id="listbox" slot="dropdown-content">
                   <dom-repeat id="menu" items="{{languages}}" as="language">
                        <template>
                             <paper-item value="{{language}}">{{localize(language)}}</paper-item>
                        </template>
                    </dom-repeat>
                </paper-listbox>
            </paper-menu-button>
        `;
    }

    static get properties() {
        return {
            services : {
                value : {
                    _localizeService: 'Localize'
                }
            }
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();
    }
    /**
     * @param evt
     * @private
     */
    _selectLanguage(evt) {
        this._localizeService.setDefaultLang(evt.detail.item.value);
    }

    /**
     * @param {Localize} localizeService
     */
    changedLocalizeService(localizeService) {
        super.changedLocalizeService(localizeService);
        this.languages = this._localizeService.getLanguages();
        for (let cont = 0; this.languages.length > cont; cont++) {
            if (this.languages[cont] === this.language) {
                this.$.listbox.selected = cont;
                break;
            }
        }
    }
}

window.customElements.define('paper-select-language', PaperSelectLanguage);