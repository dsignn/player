import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {AuthService} from "../../../../src/auth/AuthService";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-spinner/paper-spinner';
import {lang} from './language';
import { autoUpdater } from 'electron';

export class PaperIconAuth extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    display:block; 
                    padding: 5px;
                    width: 95px;
                    height: 95px;
                    border-radius: 6px;
                    --paper-tooltip-opacity : 1;
                    
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
                }

                :host(:hover){
                    background-color: #e8f0fe;
                }

                .relative {
                    position: relative;
                }

                .not-auth {
                    position: absolute;
                    top: 28px;
                    width: 69px;
                    height: 4px;
                    background: red;
                    left: -4px;
                    transform: rotate(140deg);
                }

                paper-icon-button {
                      
                    --paper-icon-button : {
                        width: 60px;
                        height: 60px;
                        color: var(--default-primary-color);
                    }
                    --paper-icon-button-disabled : {
                         background:  red;
                    }
                }

                paper-spinner {
                    display:none;
                    margin-top: 6px;
                    margin-bottom: 28px;
                    --paper-spinner-color: var(--accent-color);
                    --paper-spinner-layer-1-color: var(--accent-color);
                    --paper-spinner-layer-2-color: var(--accent-color);
                    --paper-spinner-layer-3-color: var(--accent-color);
                    --paper-spinner-layer-4-color: var(--accent-color);
                }
  
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }
            </style>
            <div class="container">
                <paper-spinner id="spinner"></paper-spinner>
                <div class="relative">
                    <paper-icon-button id="paperBackup" icon="dashboard:auth" title="{{label}}" on-tap="backup"></paper-icon-button>
                    <div id="auth" class="not-auth"></div>
                </div>
                <div style="font-size: 14px;">{{localize('auth')}}</div>
            </div>
        `
    }

    static get properties() {
        return {

            /**
             * @type Archive
             */
             _auth : {
                type: Object,
                readOnly: true,
                observer: 'changeAuth'
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _auth:  "Auth",
                    _localizeService: 'Localize'
                }
            },
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
            });

        authService.getEventManager().on(  
            AuthService.RESET_ORGANIZATION_FROM_TOKEN,
            (evt) => {
                this.isAuth(false);
            });
            
        if (authService.getOrganization()) {
            this.isAuth(true);
        } else {
            this.isAuth(false);
        }
    }

    isAuth(isAuth) {
        if (isAuth) {
            this.$.auth.style.display = 'none';
        } else {
            this.$.auth.style.display = 'block';
        }
    }
}

window.customElements.define('paper-icon-auth', PaperIconAuth);
