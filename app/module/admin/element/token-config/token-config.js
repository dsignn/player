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
import { autoUpdater } from 'electron';

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

            paper-textarea {
                line-break: anywhere;
            }

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
                <paper-input id="name" label="{{localize('name')}}"></paper-input>
                <paper-textarea id="token" label="{{localize('authorization-token')}}"></paper-textarea>
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
                    _auth: 'Auth',
                    StorageContainerAggregate : {
                        _storage :"ConfigStorage"
                    }
                }
            },

            _auth: {
                observer: 'changeAuth'
            },

            _storage: {
                observer: 'changeStorage'
            }
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    changeAuth(newValue) {
        if (!newValue) {
            return;
        }

        this.$.token.value = this._auth.getOrganizationToken();
    }

    changeStorage(newValue) {
        if (!newValue) {
            return;
        }

        newValue.get('name-plant')
            .then((data) => {
                if (data) {
                    this.$.name.value = data.name;
                }            
            });
    }

    /**
     * @param {*} evt 
     */
    _save(evt) {

        let namePlant = {
            "id": 'name-plant',
            "name":  this.$.name.value
        };

        this._storage.save(namePlant);

        this._auth.setOrganizationToken(this.$.token.value)
            .then((data) => {
                console.log('SAVE', data);
            }).catch((error) => {
                console.error(error);
            });
    }
}
window.customElements.define("token-config", TokenConfig);
