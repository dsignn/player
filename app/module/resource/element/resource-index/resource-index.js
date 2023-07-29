import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-pages/iron-pages';
import './../resource-view-list/resource-view-list'
import './../resource-view-upsert/resource-view-upsert'
import './../resource-monitor-view-list/resource-monitor-view-list'
import './../resource-monitor-view-upsert/resource-monitor-view-upsert'
import './../../../../elements/paper-filter-storage/paper-filter-storage'
import './../../../../elements/paper-input-list/paper-input-list'
import { flexStyle } from '../../../../style/layout-style';
import { lang } from './language';

/**
 * @customElement
 * @polymer
 */
class ResourceIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle} 
            <style>
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

                .searchIcon {
                    position: relative;
                    backface-visibility : hidden;
                    padding: 0;
                    height: 20px;
                    width: 20px;
                }

                .max-width-100 {
                    max-width: 100px;
                }

                .rotate {
                    rotate: 180deg;
                    transition: rotate 1s;
                }
            </style>
            <paper-tabs selected="{{selectedTab}}" tabindex="0">
                <paper-tab>{{localize('resources')}}</paper-tab>
                <paper-tab>{{localize('monitor-resource')}}</paper-tab>
            </paper-tabs>
            <iron-pages id="index" selected="{{selectedTab}}">
                <div>
                    <iron-pages id="index" selected="{{selected}}">
                        <div id="list"> 
                            <resource-view-list id="viewList" selected="{{selected}}" entity-selected="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <paper-filter-storage id="filterStorage" on-value-changed="_filterChange">
                                        <div slot="filters" class="filter-container">
                                            <paper-input name="name" label="{{localize('name')}}" ></paper-input>
                                            <paper-dropdown-menu id="type" name="type" label="{{localize('type')}}" style="padding:0px">
                                                <paper-listbox slot="dropdown-content" class="dropdown-content">
                                                    <dom-repeat id="menu" items="{{resourceType}}" as="type">
                                                        <template>
                                                            <paper-item value="{{type.value}}">{{type.name}}</paper-item>
                                                        </template>
                                                    </dom-repeat>
                                                </paper-listbox>
                                            </paper-dropdown-menu>
                                            <div style="margin-top: 29px; border-bottom: 1px solid; height: 24px; margin-right:6px;">
                                                <paper-icon-button slot="suffix" icon="clear" alt="clear" title="clear" class="searchIcon" on-tap="clearType"></paper-icon-button>
                                            </div>
                                            <paper-input name="size"  type="number" class="max-width-100" label="{{localize('size')}}" direction="down">
                                                <paper-icon-button slot="suffix" icon="low_arrow" alt="clear" title="clear" class="searchIcon" on-tap="toggleDimension"></paper-icon-button>
                                            </paper-input>
                                            <paper-input name="height" type="number" class="max-width-100" label="{{localize('height')}}" direction="down">
                                                <paper-icon-button slot="suffix" icon="low_arrow" alt="clear" title="clear" class="searchIcon" on-tap="toggleDimension"></paper-icon-button>
                                            </paper-input>
                                            <paper-input name="width" type="number" class="max-width-100" label="{{localize('width')}}"  direction="down">
                                                <paper-icon-button slot="suffix" icon="low_arrow" alt="clear" title="clear" class="searchIcon" on-click="toggleDimension"></paper-icon-button>
                                            </paper-input>
                                            <paper-input-list name="tags" label="{{localize('tags')}}"></paper-input-list>
                                        </div>
                                    </paper-filter-storage>
                                    <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                    <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-resource')}}</paper-tooltip>
                                </div>
                            </resource-view-list>
                        </div>
                        <div id="insert"> 
                            <resource-view-upsert>
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('insert-resource')}}</div>
                                    <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </resource-view-upsert>
                        </div>
                        <div id="update"> 
                            <resource-view-upsert entity="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('update-resource')}}</div>
                                    <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </resource-view-upsert>
                        </div>
                    </iron-pages>
                </div>
                <div>
                    <iron-pages id="index" selected="{{resourceMonitorSelected}}">
                        <div id="list"> 
                            <resource-view-monitor-list selected="{{resourceMonitorSelected}}" entity-selected="{{entityRMSelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <paper-filter-storage on-value-changed="_filterChange" >
                                        <div slot="filters" class="filter-container">
                                            <paper-input name="name" label="{{localize('name')}}"></paper-input>
                                        </div>
                                    </paper-filter-storage>
                                    <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayResourceMonitorAddView"></paper-icon-button>
                                    <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-monitor')}}</paper-tooltip>
                                </div>
                            </resource-view-monitor-list>
                        </div>
                        <div id="insert"> 
                            <resource-monitor-view-upsert>
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('insert-resource')}}</div>
                                    <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayResourceMonitorListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </resource-monitor-view-upsert>
                        </div>
                        <div id="update"> 
                            <resource-monitor-view-upsert entity="{{entityRMSelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('insert-resource')}}</div>
                                    <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayResourceMonitorListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </resource-monitor-view-upsert>
                        </div>
                    </iron-pages>
                    
                </div>
            </iron-pages>
    `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties() {
        return {

            resourceType: {
                value: [
                    { "name": "jpeg", "value": "image/jpeg" },
                    { "name": "jpg", "value": "image/jpeg" },
                    { "name": "png", "value": "image/png" },
                    { "name": "mp4", "value": "video/mp4" },
                    { "name": "mp3", "value": "video/mp3" },
                    { "name": "zip", "value": "application/zip" },
                ]
            },

            /**
             * @type number
             */
            selectedTab: {
                value: 0
            },

            selected: {
                type: Number,
                value: 0
            },

            resourceMonitorSelected: {
                type: Number,
                value: 0
            },

            /**
             * @type object
             */
            services: {
                value: {
                    _localizeService: 'Localize'
                }
            },
        };
    }

    _filterChange(evt) {
        this.$.viewList.filter = JSON.parse(JSON.stringify(evt.detail));
    }

    /**
     * 
     * @param {Event} evt 
     */
    toggleDimension(evt) {

        let ele = evt.target.parentElement;
        let direction = ele.getAttribute('direction');
        if (direction === 'down') {
            ele.setAttribute('direction', 'up');
            evt.target.classList.add('rotate');
        } else {
            ele.setAttribute('direction', 'down');
            evt.target.classList.remove('rotate');
        }

        if (ele.value) {
            ele.dispatchEvent(new CustomEvent('value-changed'));
        }
    }

    clearType(evt) {
        this.$.type.querySelector('paper-listbox').selected = null;
    }

    /**
     * @param {Event} evt
     */
    displayAddView(evt) {
        console.log('displayAddView');
        this.selected = 1;
    }

    displayResourceMonitorAddView(evt) {
        console.log('displayResourceMonitorAddView');
        this.resourceMonitorSelected = 1;
    }

    /**
     * @param {Event} evt
     */
    displayListView(evt) {
        this.selected = 0;
    }

    displayResourceMonitorListView(evt) {
        this.resourceMonitorSelected = 0;
    }
}
window.customElements.define('resource-index', ResourceIndex);