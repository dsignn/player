import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from '@dsign/polymer-mixin/service/injector-mixin';
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-input/paper-input';
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import "../paper-module/paper-module";
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
            }

            paper-tab {
                text-transform: uppercase;
                font-size: 16px;
                font-weight: bold;
                width: fit-content;
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
        <paper-tabs id="tabs" selected="{{selectedTab}}" tabindex="0" scrollable>
           
        </paper-tabs>
        <iron-pages id="ironPages" selected="{{selectedTab}}">
       
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
                    _localizeService: 'Localize',
                    _application: "Application",
                }
            },

            _application: {
                observer: 'changeApplication',
            },
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    changeApplication(newValue) {
        if (!newValue) {
            return;
        }

        let modules = newValue.getModules();
        for (let cont = 0; modules.length > cont; cont++) {
            let components = modules[cont].getAdminViewComponent();
            if (components.length > 0) {
               
                let ele = document.createElement('paper-tab');
                let title = this.localize(modules[cont].getName()) ? this.localize(modules[cont].getName()) : `Config ${modules[cont].getName()}`
                ele.innerHTML = title;
                this.$.tabs.append(ele);

                let container = document.createElement('div');
                container.setAttribute("id", modules[cont].getName());
                for (let cont = 0; components.length > cont; cont++) {
                    container.append(document.createElement(components[cont].getName()));
                }

                this.$.ironPages.append(container);
            }
        }
    }
}
window.customElements.define("admin-index", AdminIndex);
