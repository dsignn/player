import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-repeat.js';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import {P3ELocalizeElement} from "../p3e-localize";
import {lang} from "./language/language.js";

/**
 * @customElement
 * @polymer
 */
export class P3ESelectLanguage extends P3ELocalizeElement {

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
        this.localizeService.setDefaultLang(evt.detail.item.value);
    }

    /**
     * @param changeLocalizeService
     */
    changeLocalizeService(changeLocalizeService) {
        super.changeLocalizeService(changeLocalizeService);
        this.languages = this.localizeService.getLanguages();
        for (let cont = 0; this.languages.length > cont; cont++) {
            if (this.languages[cont] === this.language) {
                this.$.listbox.selected = cont;
                break;
            }
        }
    }
}

window.customElements.define('p3e-select-language', P3ESelectLanguage);