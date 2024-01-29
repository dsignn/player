import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-badge/paper-badge';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

/**
 * @class
 */
export class PaperInfo extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    --paper-tooltip-opacity : 1;
                    display:block; 
                    padding: 5px;
                    width: 40px;
                    height: 40px;
                    border-radius: 6px;
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
                }

                #dialog {
                    outline: none;
                    position: fixed;
                    top: 32px;
                    z-index: 103;
                    width: 331px;
                    max-width: 331px;
                    right: -32px;
                    border-radius: 6px;
                }

                .container {
                    margin: 20px 0px;
                }

                .item {
                    margin-top: 0px;
                    padding: 6px 0px;
                }

                paper-badge {
                    --paper-badge-margin-left: -20px;
                    --paper-badge-margin-bottom: -14px;

                    --paper-badge: {
                        font-size: 14px;
                    }
                   
                }
 
            </style>
            <paper-icon-button id="btn" icon="info" on-tap="openInfo" raised></paper-icon-button>
            <paper-badge id="badge" for="btn" label=""></paper-badge>
            <paper-dialog id="dialog" no-overlap horizontal-align="left" vertical-align="top">
                <div class="container">
                    <dom-repeat id="rMess" items="{{messages}}" as="item">
                        <template>
                            <div class="item">{{item.message}}</div>
                        </template>
                    </dom-repeat>
                </div>
            </paper-dialog>`
    }

    static get properties() {
        return {

            messages: {
                value: [],
                observer: 'changeMessages'
            },

            services : {
                value : {
                   _messageService: 'Messages'
                }
            },

            _messageService: {
                observer: 'changeMessageService'
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    changeMessages(newValue) {
        
        this._updateMEssages();
    }

    openInfo(evt) {
        this.$.dialog.positionTarget = evt.element;
        this.$.dialog.open();
    }

    changeMessageService(service) {
        if (!service) {
            return;
        }

        service.getEventManager().on(
            'append_message',
            () => {
                this._updateMEssages();
            }
        );

        service.getEventManager().on(
            'remove_message',
            () => {
                this._updateMEssages();
            }
        );

        this.messages = service.getMessages();
    }

    _updateMEssages() {

        if (!this._messageService) {
            return;
        }

        this.messages = this._messageService.getMessages();

        if (!this.messages || ( Array.isArray(this.messages) && this.messages.length == 0)) {
            this.$.btn.disabled = true;
            this.$.badge.label = '';
            this.$.badge.style.display = 'none';
        } else {
            this.$.btn.disabled = false;
            this.$.badge.label = this.messages.length;
            this.$.badge.style.display = 'unset';
        }

        this.$.rMess.render();
    }
}

window.customElements.define('paper-info', PaperInfo);
