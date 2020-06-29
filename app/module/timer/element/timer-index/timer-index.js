import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import {flexStyle} from '../../../../style/layout-style';
import {lang} from "./language";
import '../timer-view-list/timer-view-list'
import '../timer-view-upsert/timer-view-upsert'

/**
 * Entry point for the module timer
 *
 * @customElement
 * @polymer
 */
class TimerIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement))  {
    static get template() {
        return html`
                ${flexStyle} 
                <style>
                    div.header {
                        @apply --header-view-list;
                    }
                               
                    paper-icon-button.circle {
                        @apply --paper-icon-button-action;
                    }
                </style>
                <iron-pages id="ironPages" selected="{{selected}}">
                <div id="list">
                    <timer-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                         <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('list-timer')}}</div>
                            <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                            <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-timer')}}</paper-tooltip>
                         </div>
                    </timer-view-list>
                </div>
                <div id="add">
                   <timer-view-upsert>
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('insert-timer')}}</div>
                            <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                            <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                        </div>
                    </timer-view-upsert>
                </div>
                <div id="update">
                    <timer-view-upsert entity="{{entitySelected}}">
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('update-timer')}}</div>
                            <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                            <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                        </div>
                    </timer-view-upsert>
                </div>
            </iron-pages> 
        `;
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

    constructor() {
        super();
        this.resources = lang;
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
window.customElements.define("timer-index", TimerIndex);
