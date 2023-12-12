import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

/**
 * @class
 */
export class PaperGpu extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    --paper-tooltip-opacity : 1;
                    display:block; 
                    padding: 5px;
                    width: 95px;
                    height: 95px;
                    border-radius: 6px;
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
                <paper-icon-button id="paperGpu" icon="gpu" on-tap="open"></paper-icon-button>
                <paper-tooltip id="paperTooltip" for="paperGpu" position="left">{{localize('view-gpu')}}</paper-tooltip>
                <div style="font-size: 16px;">Gpu</div>
            </div>`
    }

    static get CLOSE() { return 'paper-gpu-close'; }

    static get OPEN() { return 'paper-gpu-open'; }

    static get properties() {
        return {

            services : {
                value : {
                    SenderContainerAggregate:  {
                        _sender : 'Ipc'
                    },
                    ReceiverContainerAggregate:  {
                        _receiver : 'Ipc'
                    }
                }
            },

            /**
             * @type SenderInterface
             */
            _sender : {
                type: Object,
                readOnly: true
            },

            /**
             * @type ReceiverInterface
             */
            _receiver : {
                type: Object,
                readOnly: true,
                observer: "changedReceiver"
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param {CustomEvent} evt
     */
    open(evt) {

        this._sender.send('proxy', {
            event : PaperGpu.OPEN,
            data: {}
        });
        this.$.paperGpu.disabled = true;
    }

    /**
     * @param newValue
     */
    changedReceiver(receiverService) {
        if (!receiverService) {
            return;
        }
        receiverService.on(PaperGpu.CLOSE, this._enable.bind(this))
    }

    /**
     * @param evt
     * @private
     */
    _enable(evt) {
        this.$.paperGpu.disabled = false;
    }
}

window.customElements.define('paper-gpu', PaperGpu);
