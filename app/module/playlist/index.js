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
class PlaylistIndex extends DsignLocalizeElement {

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
                <iron-pages id="index" selected="{{selected}}">
                    <div id="list"> 
                         <playlist-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                             <div slot="header" class="layout-horizontal layout-center-aligned header">
                                <div class="layout-flex">{{localize('list-playlist')}}</div>
                                <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-playlist')}}</paper-tooltip>
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
            selected: {
                type: Number,
                value: 1
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
