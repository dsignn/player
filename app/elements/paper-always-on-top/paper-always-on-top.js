import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../mixin/service/injector-mixin";
import {LocalizeMixin} from "../mixin/localize/localize-mixin";
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
                    padding: 8px;
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
                }

                paper-toggle-button {
                    cursor: pointer !important;
                }  
            </style>
            <paper-toggle-button id="paperToggleEnable" on-change="_changeAlwaysOnTop"></paper-toggle-button>
            <paper-tooltip for="paperToggleEnable" position="left">{{localize('enable-always-on-top')}}</paper-tooltip>
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
