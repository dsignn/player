import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-menu-button/paper-menu-button';
import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperMonitor extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

    static get template() {
        return html`
            <style >
                paper-card {
                    @apply --layout-horizontal;
                    @apply --application-paper-card;
                    margin-right: 4px;
                    margin-bottom: 4px;
                }
                
                #left-section {
                    width: 80px;
                    min-height: 120px;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    @apply --application-paper-card-left-content;
                }
                
                #fastAction {
                    border-right: 1px solid var(--divider-color);
                }
                
                #fastAction .action {
                    height: 30px;
                    @apply --layout;
                    @apply --layout-center
                    @apply --layout-center-justified;
                }
                
                #right-section {
                    @apply --layout-horizontal;
                    @apply --layout-flex;
                }
                
                #content {
                    @apply --layout-flex;
                    padding: 4px;
                }  
                   
                paper-menu-button {
                    padding: 0;
                }
    
            </style>
            <paper-card>
                <div id="left-section"></div>
                <div id="fastAction">
                    <div class="action">
                        <paper-toggle-button id="paperToggleEnable" on-change="_toggleEnableMonitor" checked="{{entity.enable}}"></paper-toggle-button>
                        <paper-tooltip for="paperToggleEnable" position="bottom">{{localize('enable-monitor')}}</paper-tooltip>
                    </div>
                </div>
                <div id="right-section">
                    <div id="content">
                        {{entity.name}}
                    </div>
                    <div id="crud">
                        <paper-menu-button ignore-select horizontal-align="right">
                            <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                            <paper-listbox slot="dropdown-content" multi>
                                <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                            </paper-listbox>
                        </paper-menu-button>
                    </div>
                </div>
            </paper-card>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {
            services : {
                value : {
                    "StorageContainerAggregate": {
                        "monitorStorage":"MonitorStorage"
                    }
                }
            },

            monitorStorage : {
                observer: 'observerStorageToUpdateEntity'
            }
        }
    }

    /**
     * @param evt
     * @private
     */
    _update(evt) {
        this.dispatchEvent(new CustomEvent('update', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _delete(evt) {
        this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _toggleEnableMonitor(evt) {
        let event = evt.target.checked ? 'enable-monitor' : 'disable-monitor';
        this.dispatchEvent(new CustomEvent(event, {detail: this.entity}));
    }
}
window.customElements.define('paper-monitor', PaperMonitor);