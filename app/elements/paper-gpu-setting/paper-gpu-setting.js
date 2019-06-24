import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../localize/dsign-localize";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

export class PaperGpuSetting extends DsignLocalizeElement {

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

            archive : {
                observer: 'changeArchiveService'
            },

            services : {
                value : {
                    SenderContainerAggregate:  {
                        sender : 'Ipc'
                    },
                    ReceiverContainerAggregate:  {
                        receiver : 'Ipc'
                    }
                }
            },

            receiver : {
                observer: "observerReceiverService"
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

        this.sender.send('proxy', {
            event : PaperGpuSetting.OPEN,
            data: {}
        });
        this.$.paperGpu.disabled = true;
    }

    /**
     * @param newValue
     */
    observerReceiverService(newValue) {
        if (!newValue) {
            return;
        }
        newValue.on(PaperGpuSetting.CLOSE, this._enable.bind(this))
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
