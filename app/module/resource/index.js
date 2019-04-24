import {html} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-icon-button/paper-icon-button';
import {DsignLocalizeElement} from "../../elements/localize/dsign-localize";
import '@polymer/iron-pages/iron-pages';
import './element/view/list'
import './element/view/upsert'
import {flexStyle} from '../../style/layout-style';
import {lang} from './language';
/**
 * @customElement
 * @polymer
 */
class ResourceIndex extends DsignLocalizeElement {

    static get template() {
        return html`
            ${flexStyle} 
            <style>
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                }
            </style>
            <iron-pages id="index" selected="{{selected}}">
                <div id="list"> 
                    <resource-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                         <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('list-resource')}}</div>
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
                value: 0
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
window.customElements.define('resource-index', ResourceIndex);