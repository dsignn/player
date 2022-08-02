import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from '@dsign/polymer-mixin/service/injector-mixin';
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-input/paper-input';
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import "../paper-module/paper-module";
import { lang } from './language';

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
                <div class="row margin-b">
                    <paper-input-file id="fileUpload" label="{{localize('load-module')}}" accept="application/zip" value="{{fileValue}}"></paper-input-file>
                    <paper-button id="fileBtn" on-tap="importModule" disabled>{{localize('load')}}</paper-button>
                </div>
                <div>
                    <dom-repeat id="modules" items="{{modules}}" as="module" sort="sortModule">
                        <template>
                            <paper-module module="{{module}}" direction="horizontal"></paper-module>
                        </template>
                    </dom-repeat>
                <div>        
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

            fileValue: {
                notify: true,
                observer: 'changeFileValue'
            },

            /**
             * @type object
             */
            services: {
                value: {
                    _application: "Application",
                    _localizeService: 'Localize'
                }
            },

            modules: {
                notify: true,
            },

            _application: {
                observer: 'applicationChange'
            }
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    changeFileValue(value) {
        if (value) {
            this.$.fileBtn.disabled = false;
        } else {
            this.$.fileBtn.disabled = true;
        }
    }

    /**
     * @param {Event} evt 
     */
    importModule(evt) {
        this._application.importModule(this.$.fileUpload.files[0].path, container);
    }

    /**
     * @param {Application} application 
     */
    applicationChange(application) {
        if (!application) {
            return;
        }

        this.modules = application.getModules();
    }

    sortModule(item1, item2) {
        return item1.core > item2.core ? -1 : 1;
    }
}
window.customElements.define("admin-index", AdminIndex);
