import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-spinner/paper-spinner';
import {lang} from './language';
import {ConnectionService} from './../../../../src/ConnectionService'

export class PaperInternetStatus extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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
  
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }

                .offline {
                    color:red;
                }

                .online {
                 
                }

            </style>
            <div class="container">
                <paper-spinner id="spinner"></paper-spinner>
                <paper-icon-button id="paperInternetStatus" icon="internet" title="{{label}}" class="offline"></paper-icon-button>
                <paper-tooltip for="paperInternetStatus" position="bottom">{{localize(label)}}</paper-tooltip>
                <div style="font-size: 16px;">Status</div>
            </div>
        `
    }

    static get properties() {
        return {

            status: {
                notify: true,
                observer: 'changeStatus'
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    _connection: 'Connection'
                }
            },

            label: {
                value: 'internet-disable'
            },

            /**
             * @type Connection
             */
            _connection : {
                type: Object,
                readOnly: true,
                observer: 'changeConnection'
            },

        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    changeConnection(newValue) {
        newValue.getEventManager().on(ConnectionService.CHANGE_STATUS, this._changeStatusHandler.bind(this));
        this.status = newValue.getStatus();
    }

    _changeStatusHandler(evt) {
        this.status = evt.data;
    }

    changeStatus(newValue) {
        if (newValue === ConnectionService.ONLINE) {
            this.$.paperInternetStatus.className = 'online';
            this.label = 'internet-enable';
        } else {
            this.$.paperInternetStatus.className = 'offline';
            this.label = 'internet-disable';
        }
    }
}

window.customElements.define('paper-internet-status', PaperInternetStatus);
