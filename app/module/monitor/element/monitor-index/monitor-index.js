import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tabs/paper-tabs';
import './../../../../elements/paper-filter-storage/paper-filter-storage'
import '../monitor-view-list/monitor-view-list'
import '../monitor-view-upsert/monitor-view-upsert'
import {flexStyle} from '../../../../style/layout-style';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class MonitorIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle} 
            <style>
                div.header {
                    @apply --header-view-list;
                }
                
                paper-tabs {
                    margin-bottom: 8px;
                    max-width: 450px;
                }

                paper-tab {
                    text-transform: uppercase;
                    font-size: 18px;
                    font-weight: bold;
                }
            
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                }
                
                .topology {
                    position: relative;
                }

                paper-filter-storage {
                    flex: 1;
                    --paper-filter-storage : {
                        padding: 0 8px;
                        align-items: center;
                        display: flex;
                        min-height: 70px;
                        width: -webkit-fill-available;
                        margin-right: 8px;

                    }
                }

                .filter-container {
                    display: flex;
                    padding-bottom: 6px;
                }

                .filter-container > * { 
                    padding-right: 6px;
                }
            </style>
            <paper-tabs selected="{{selectedTab}}" tabindex="0">
                <paper-tab>{{localize('monitor-data')}}</paper-tab>
                <paper-tab>{{localize('current-topology')}}</paper-tab>
            </paper-tabs>
            <iron-pages id="index" selected="{{selectedTab}}">
                <div>
                    <iron-pages id="index" selected="{{selected}}">
                        <div id="list"> 
                            <monitor-view-list id="viewList" selected="{{selected}}" entity-selected="{{entitySelected}}">
                                 <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <paper-filter-storage on-value-changed="_filterChange" >
                                        <div slot="filters" class="filter-container">
                                            <paper-input name="name" label="{{localize('name')}}"></paper-input>
                                        </div>
                                    </paper-filter-storage>
                                    <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                    <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-monitor')}}</paper-tooltip>
                                 </div>
                            </monitor-view-list>
                        </div>
                        <div id="insert"> 
                            <monitor-view-upsert>
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('insert-monitor')}}</div>
                                    <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </monitor-view-upsert>
                        </div>
                        <div id="update"> 
                            <monitor-view-upsert entity="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('update-monitor')}}</div>
                                    <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </monitor-view-upsert>
                        </div>
                    </iron-pages>
                </div>
                <div class="topology">
                    <dom-repeat items="{{physicalMonitors}}" as="monitor">
                        <template>
                             <paper-monitor-viewer width="{{monitor.size.width}}" height="{{monitor.size.height}}" top="{{monitor.bounds.y}}" left="{{monitor.bounds.x}}"></paper-monitor-viewer>
                        </template>
                    </dom-repeat>
                </div>
            </iron-pages>
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {

            /**
             * @type number
             */
            selectedTab: {
                value: 0
            },

            /**
             * @type number
             */
            selected: {
                type: Number,
                value: 0
            },

            /**
             * @type Array
             */
            physicalMonitors: {
                type: Array,
                value: []
            },

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
                observer: "observerMonitorService"
            }
        };
    }

    _filterChange(evt) {
        this.$.viewList.filter = JSON.parse(JSON.stringify(evt.detail));
    }

    /**
     * @param evt
     */
    displayAddView(evt) {
        this.selected = 1;
    }

    /**
     * @param evt
     */
    displayListView(evt) {
        this.selected = 0;
    }

    /**
     * @param {MonitorService} monitorService
     */
    observerMonitorService(monitorService) {
        if (!monitorService) {
            return;
        }

        // TODO make refactor
        setTimeout(
            () => {
                this.set('physicalMonitors', monitorService.getPhysicalMonitor());
            },
            1000
        )

    }
}
window.customElements.define('monitor-index', MonitorIndex);
