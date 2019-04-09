import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../localize/dsign-localize";
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

class PaperAlwaysOnTop extends DsignLocalizeElement {

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
                }
  
            </style>
            <paper-toggle-button id="paperToggleEnable" on-change="_changeAlwaysOnTop"></paper-toggle-button>
            <paper-tooltip for="paperToggleEnable" position="left">{{localize('enable-always-on-top')}}</paper-tooltip>
        `
    }

    static get properties () {
        return {
            services : {
                value : {
                    monitorService: "MonitorService"
                }
            },

            monitorService: {
                observer: "observerMonitorService"
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    observerMonitorService(service) {
        if (!service) {
            return;
        }

        this.$.paperToggleEnable.checked = service.getAlwaysOnToDashboard();
    }

    /**
     *
     * @param evt
     * @private
     */
    _changeAlwaysOnTop(evt) {
        this.monitorService.setAlwaysOnToDashboard(evt.target.checked);
    }
}
window.customElements.define('paper-always-on-top', PaperAlwaysOnTop);