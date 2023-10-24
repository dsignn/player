import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from '@dsign/polymer-mixin/service/injector-mixin';
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
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
class TokenConfig extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
        <style>

            .action {
                display: flex;
                justify-content: flex-end;
            }

            paper-button {
                margin: 0;
                --paper-button-disabled : {        
                    color: white;
                    background-color: #c9c9c9 !important;
                    background: #c9c9c9 !important;
                }
            }
    
        </style>
        <div>
            <div class="row margin-b">
                <paper-textarea id="token" label="Token"></paper-textarea>
                <div class="action">
                    <paper-button id="fileBtn" on-tap="_save">save</paper-button>
                </div>
            </div>     
        </div>`;
    }

    static get properties() {
        return {

            /**
             * @type object
             */
            services: {
                value: {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        "_configStorage":"ConfigStorage"
                    }
                }
            },

            _configStorage: {
                observer: 'changeConfigStorage'
            }
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    changeConfigStorage(newValue) {
        if (!newValue) {
            return;
        }

        let token = newValue.get('token')
            .then((data) => {
                if (data) {
                    this.$.token.value = data.token;
                }
               
            }).catch((error) => {
                console.error(error);
            });
    }

    /**
     * @param {*} evt 
     */
    _save(evt) {

        //let 
        let token = {
            "id": "token",
            "token": this.$.token.value
        };

        this._configStorage.save(token)
            .then((data) => {
                console.log('SAVE', data);
            }).catch((error) => {
                console.error(error);
            });
    }
}
window.customElements.define("token-config", TokenConfig);
