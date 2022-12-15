import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageEntityMixin} from "@dsign/polymer-mixin/storage/entity-mixin";
import {MonitorService} from "../../src/MonitorService";
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@polymer/paper-menu-button/paper-menu-button';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PaperMonitor extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
              background-image: url("./../../module/monitor/element/paper-monitor/img/cover.png");      
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
                    word-break: break-all;
                    overflow: hidden;
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
                        <paper-menu-button id="crudButton" ignore-select horizontal-align="right">
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
            /**
             * @object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    _monitorService: "MonitorService",
                    "StorageContainerAggregate": {
                        "_storage":"MonitorStorage"
                    }
                }
            },

            /**
             * @type StorageInterface
             */
            _storage: {
                type: Object,
                readOnly: true
            },

            /**
             * @type true
             */
            autoUpdateEntity: {
                value: true
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

    /**
     * @param evt
     * @private
     */
    _update(evt) {
        this.dispatchEvent(new CustomEvent('update', {detail: this.entity}));
        this.$.crudButton.close();
    }

    /**
     * @param evt
     * @private
     */
    _delete(evt) {
        this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
        this.$.crudButton.close();
    }

    /**
     * @param evt
     * @private
     */
    _toggleEnableMonitor(evt) {
        let event = evt.target.checked ? 'enable-monitor' : 'disable-monitor';
        this.dispatchEvent(new CustomEvent(event, {detail: this.entity}));
    }

    changeMonitorService(service) {
        service.getEventManager().on(MonitorService.LOAD_MONITOR, (data) => {
            this.$.paperToggleEnable.disabled = true;
        });

        service.getEventManager().on(MonitorService.LOADING_MONITOR_FINISH, (data) => {
            this.$.paperToggleEnable.disabled = false;
        });
    }
}
window.customElements.define('paper-monitor', PaperMonitor);