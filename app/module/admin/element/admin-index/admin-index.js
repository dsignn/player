import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from '@dsign/polymer-mixin/service/injector-mixin';
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-input/paper-input';
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import "../paper-module/paper-module";
import "./../module-config/module-config";
import { lang } from './language';
import { Application } from '@dsign/library/src/core/Application';
import { Listener } from '@dsign/library/src/event';

/**
 * Entry point for the module admin
 *
 * @customElement
 * @polymer
 */
class AdminIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
        <style>
            
            paper-tabs {
                margin-bottom: 8px;
                max-width: 250px;
            }

            #fileUpload {
                width: 100%;
            }

            paper-module {
                margin-bottom: 6px;
                ---paper-module : {
                    height: 40px;
                }
            }

            paper-button {
                margin: 0;
                margin-left: 8px;
                --paper-button-disabled : {        
                    color: white;
                    background-color: #c9c9c9 !important;
                    background: #c9c9c9 !important;
                }
            }

            .row {
                display: flex;
            }

            .margin-b {
                margin-bottom: 8px;
            }
    
        </style>
        <paper-tabs selected="{{selectedTab}}" tabindex="0">
            <paper-tab>{{localize('general')}}</paper-tab>
        </paper-tabs>
        <iron-pages id="ironPages" selected="{{selectedTab}}">
            <div>
               <module-config><module-config>
            </div>
        </iron-pages>
        `;
    }

    static get properties() {
        return {

            /**
             * @type number
             */
            selectedTab: {
                type: Number,
                value: 0
            },

            /**
             * @type object
             */
               services: {
                value: {
                    _localizeService: 'Localize'
                }
            },
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }
}
window.customElements.define("admin-index", AdminIndex);
