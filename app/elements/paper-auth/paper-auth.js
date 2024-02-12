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

                #logged {
                    padding-top: 8px;
                    display: none;
                }
  
            </style>

            <div class="container">
                <iron-form id="formLogin">
                    <form method="post" action="">
                        <paper-input id="username" label="{{localize('username')}}" required></paper-input>
                        <paper-input id="password" type="password" label="{{localize('password')}}" required></paper-input>
                    </form>
                    <paper-button id="loginBtn" on-tap="loginButton">{{localize('login')}}</paper-button>
                </iron-form>
                <div id="logged">
                    <div>{{identity.name}}</div>
                    <div>{{identity.lastName}}</div>
                    <paper-button id="logoutBtn" on-tap="logout">{{localize('logout')}}</paper-button>
                </div>
            </div>`
    }

    static get properties() {

        
        return {

            identity: {
                notify: true,
                value: null
            },

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
                value: 1,
                notify: true
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();
        this.$.formLogin.addEventListener('iron-form-presubmit', this.submitLogin.bind(this));
    }

    loginButton(evt) {
        this.$.formLogin.submit();
    }

    /**
     * @param evt
     */
    submitLogin(evt) {

        this._auth.login(this.$.username.value, this.$.password.value).then((data) => {
                console.log(data);
            }).catch((error) => {
                console.log(error);
            });
    }

    logout() {
        this._auth.logout();
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

        authService.getEventManager().on(  
            AuthService.LOAD_IDENTITY_EVT,
            (evt) => {
           
                this.identity = evt.data;
                this.hasIdentity(true);
            });

        authService.getEventManager().on(  
            AuthService.LOGOUT,
            (evt) => {
            
                this.identity = null;
                this.hasIdentity(false);
            });
     
            
        if (authService.getOrganization()) {
            this.isAuth(true);
        } else {
            this.isAuth(false);
        }

        if (authService.getIdentity()) {
            this.identity = authService.getIdentity();
            this.hasIdentity(true);
        }
    }

    hasIdentity(hasIdentity) {
        if (hasIdentity) {
            this.$.logged.style.display = 'block';
            this.$.formLogin.style.display = 'none';
        } else {
            this.$.logged.style.display = 'none';
            this.$.formLogin.style.display = 'block';
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
