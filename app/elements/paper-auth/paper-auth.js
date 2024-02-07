import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-input/paper-input';
import { ServiceInjectorMixin } from '@dsign/polymer-mixin/service/injector-mixin';
import { LocalizeMixin } from '@dsign/polymer-mixin/localize/localize-mixin';
import {lang} from './language';
import { AuthService } from '../../src/auth/AuthService';

/**
 * @class PaperAuth
 */
export class PaperAuth extends  LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    display: block;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                }
  
            </style>

            <div class="container">
                <iron-form id="formMonitorContainer">
                    <form method="post" action="">
                        <paper-input id="username" label="{{localize('username')}}"></paper-input>
                        <paper-input id="password" label="{{localize('password')}}"></paper-input>
                    </form>
                    <paper-button id="loginBtn" on-tap="login">{{localize('login')}}</paper-button>
                </iron-form>
            </div>`
    }

    static get properties() {

        
        return {

            _auth : {
                type: Object,
                readOnly: true,
                observer: 'changeAuth'
            },

            services : {
                value : {
                    _localizeService: 'Localize',    
                    _auth:  "Auth",
                }
            },

            selected: {
                value: 1
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }


    /**
     * @param {Archive} archiveService
     */
    changeAuth(authService) {
        if (!authService) {
            return;
        }

        authService.getEventManager().on(  
            AuthService.LOADED_ORGANIZATION_FROM_TOKEN,
            (evt) => {
                this.isAuth(true);
                this.selected = 1;
            });

        authService.getEventManager().on(  
            AuthService.RESET_ORGANIZATION_FROM_TOKEN,
            (evt) => {
                this.isAuth(false);
                this.selected = 1;
            });
            
        if (authService.getOrganization()) {
            this.isAuth(true);
        } else {
            this.isAuth(false);
        }
    }


    isAuth(isAuth) {
        if (isAuth) {
            this.$.password.disabled = false;
            this.$.username.disabled = false;
            this.$.loginBtn.disabled = false;
        } else {
            this.$.password.disabled = true;
            this.$.username.disabled = true;
            this.$.loginBtn.disabled = true;
        }
    }
}

window.customElements.define('paper-auth', PaperAuth);
