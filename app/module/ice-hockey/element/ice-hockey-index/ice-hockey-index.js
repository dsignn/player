import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tabs/paper-tabs';
import '../ice-hockey-view-list/ice-hockey-view-list';
import '../ice-hockey-view-upsert/ice-hockey-view-upsert';
import '../ice-hockey-scoreboard/ice-hockey-scoreboard';
import {flexStyle} from '../../../../style/layout-style';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class IceHockeyIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle} 
            <style>
                div.header {
                    @apply --header-view-list;
                }
                
                paper-tabs {
                    margin-bottom: 8px;
                    max-width: 250px;
                }
            
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                }
                
                .topology {
                    position: relative;
                }
                
                paper-autocomplete {
                    --autocomplete-wrapper: {
                        position: absolute;
                        min-width:250px;
                    }
                }

                ice-hockey-scoreboard {
                    display:none;
                }
            </style>
            <paper-tabs selected="{{selectedTab}}" tabindex="0">
                <paper-tab>{{localize('general')}}</paper-tab>
                <paper-tab>{{localize('scoreboard')}}</paper-tab>
            </paper-tabs>
            <iron-pages id="ironPages" selected="{{selectedTab}}">
                <div> 
                    <iron-pages id="index" selected="{{selected}}">
                        <div id="list"> 
                            <ice-hockey-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('list-ice-hockey-match')}}</div>
                                    <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                    <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-playlist')}}</paper-tooltip>
                                </div>
                            </ice-hockey-view-list>
                        </div>
                        <div id="insert"> 
                            <ice-hockey-view-upsert>
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('insert-ice-hockey-match')}}</div>
                                    <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </ice-hockey-view-upsert>
                        </div>
                        <div id="update"> 
                            <ice-hockey-view-upsert entity="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('update-ice-hockey-match')}}</div>
                                    <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </ice-hockey-view-upsert>
                        </div>
                    </iron-pages>          
                </div>
                <div>
                    <paper-autocomplete
                        id="defaultTimeslot"
                        label="{{localize('choose-match')}}"
                        text-property="name"
                        value-property="name"
                        remote-source
                        on-autocomplete-change="_searchChanged"
                        on-autocomplete-selected="_selectMatch">
                            <template slot="autocomplete-custom-template">
                                <style>
                                    :host {
                                        display: block;
                                    }

                                    paper-item {
                                        padding: 0 2px;
                                    }

                                </style>
                                <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                    <div index="[[index]]">
                                        <div class="service-name">[[item.name]]</div>
                                    </div>
                                </paper-item>
                            </template>
                    </paper-autocomplete>
                    <ice-hockey-scoreboard></ice-hockey-scoreboard>  
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
                type: Number,
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
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _iceHockeyMatchStorage: "IceHockeyMatchStorage"
                    },
                    scoreboardService: 'IceHockeyScoreboardService'
                }
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
     * @param {Event} evt
     * @private
     */
    _searchChanged(evt) {
        if (!evt.detail.value) {
            return;
        }

        this._iceHockeyMatchStorage
            .getAll({name: evt.detail.value.text})
            .then(
                (data) => {
                    evt.detail.target.suggestions(data);
                }
            );
    }

    /**
     * @param {Event} evt
     * @private
     */
    _selectMatch(evt) {
        this.scoreboardService.setMatch(evt.detail.value);
        let ele = this.shadowRoot.querySelector('ice-hockey-scoreboard');
        if (evt.detail.value.getId()) {
            ele.style.display = 'block';
        } else {
            ele.style.display = 'none';
        }
    }
}

window.customElements.define('ice-hockey-index', IceHockeyIndex);
