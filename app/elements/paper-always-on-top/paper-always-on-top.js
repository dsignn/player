import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

/**
 * @class
 */
export class PaperAlwaysOnTop extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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

                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }

                paper-toggle-button {
                    cursor: pointer !important;
                    height: 56px;
                }  
            </style>
            <div class="container">
                <paper-toggle-button id="paperToggleEnable" on-change="_changeAlwaysOnTop"></paper-toggle-button> 
                <div style="font-size: 16px;">On top</div>
            </div>
            <!--<paper-tooltip for="paperToggleEnable" position="left">{{localize('enable-always-on-top')}}</paper-tooltip>-->
        `
    }

    static get properties () {
        return {
            /**
             * @type object
             */
            services : {
                value : {
                    _monitorService: "MonitorService",
                    _localizeService: 'Localize'
                }
            },

            /**
             * @type MonitorService
             */
            _monitorService: {
                type: Object,
                readOnly: true,
                observer: "changeMonitorService"
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param {MonitorService} monitorService
     */
    changeMonitorService(monitorService) {
        if (!monitorService) {
            return;
        }

        this.$.paperToggleEnable.checked = monitorService.getAlwaysOnToDashboard();
    }

    /**
     * @param evt
     * @private
     */
    _changeAlwaysOnTop(evt) {
        this._monitorService.setAlwaysOnToDashboard(evt.target.checked);
    }
}
window.customElements.define('paper-always-on-top', PaperAlwaysOnTop);
