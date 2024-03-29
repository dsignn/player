import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tabs/paper-tabs';
import '../playlist-view-list/playlist-view-list'
import '../playlist-view-upsert/playlist-view-upsert'
import {flexStyle} from '../../../../style/layout-style';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PlaylistIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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
            </style>
            <iron-pages id="index" selected="{{selected}}">
                <div id="list"> 
                    <playlist-view-list id="viewList" selected="{{selected}}" entity-selected="{{entitySelected}}">
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <paper-filter-storage id="filterStorage" on-value-changed="_filterChange">
                                <div slot="filters" class="filter-container">
                                    <paper-input name="name" label="{{localize('name')}}" ></paper-input>
                                </div>
                            </paper-filter-storage>
                            <paper-icon-button id="iconBackInsert" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                            <paper-tooltip for="iconBackInsert" position="left">{{localize('insert-playlist')}}</paper-tooltip>
                        </div>
                    </playlist-view-list>
                </div>
                <div id="insert"> 
                    <playlist-view-upsert>
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('insert-playlist')}}</div>
                            <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                            <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                        </div>
                    </playlist-view-upsert>
                </div>
                <div id="update"> 
                    <playlist-view-upsert entity="{{entitySelected}}">
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('update-playlist')}}</div>
                            <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                            <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                        </div>
                    </playlist-view-upsert>
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
            selected: {
                type: Number,
                value: 0
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize'
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
}
window.customElements.define('playlist-index', PlaylistIndex);
