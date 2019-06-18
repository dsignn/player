import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../elements/localize/dsign-localize";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tabs/paper-tabs';
import './element/view/list'
import './element/view/upsert'
import {flexStyle} from '../../style/layout-style';
import {lang} from './language';
/**
 * @customElement
 * @polymer
 */
class MonitorIndex extends DsignLocalizeElement {

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
            
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                }
                
                .topology {
                    position: relative;
                }
            </style>
            <paper-tabs selected="{{selectedTad}}" tabindex="0">
                <paper-tab>{{localize('monitor-data')}}</paper-tab>
                <paper-tab>{{localize('current-topology')}}</paper-tab>
                <paper-tab>{{localize('gpu-settings')}}</paper-tab>
            </paper-tabs>
            <iron-pages id="index" selected="{{selectedTad}}">
                <div>
                    <iron-pages id="index" selected="{{selected}}">
                        <div id="list"> 
                            <monitor-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                                 <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('list-monitor')}}</div>
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
                <div>
                    suca
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
            selectedTad: {
                value: 0
            },

            selected: {
                type: Number,
                value: 0
            },

            physicalMonitors: {
                type: Array,
                value: []
            },

            services : {
                value : {
                    monitorService: "MonitorService"
                }
            },

            monitorService: {
                observer: "observerMonitorService"
            }
        };
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
     * @param {MonitorService} service
     */
    observerMonitorService(service) {
        if (!service) {
            return;
        }

        this.set('physicalMonitors', service.getPhysicalMonitor());
    }
}
window.customElements.define('monitor-index', MonitorIndex);
