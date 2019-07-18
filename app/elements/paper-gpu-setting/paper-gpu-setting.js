import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../mixin/service/injector-mixin";
import {LocalizeMixin} from "../mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

/**
 * @class
 */
export class PaperGpuSetting extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    --paper-tooltip-opacity : 1;
                    
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
  
                    --paper-icon-button-disabled : {               
                        color:  var(--accent-color);
                    }
                }
  
            </style>

            <paper-icon-button id="paperGpu" icon="gpu" on-tap="open"></paper-icon-button>
            <paper-tooltip id="paperTooltip" for="paperGpu" position="left">{{localize('view-gpu')}}</paper-tooltip>
        `
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
            event : PaperGpuSetting.OPEN,
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
        receiverService.on(PaperGpuSetting.CLOSE, this._enable.bind(this))
    }

    /**
     * @param evt
     * @private
     */
    _enable(evt) {
        this.$.paperGpu.disabled = false;
    }
}

window.customElements.define('paper-gpu-setting', PaperGpuSetting);
