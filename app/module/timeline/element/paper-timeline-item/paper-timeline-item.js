import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../../../elements/mixin/service/injector-mixin";
import {LocalizeMixin} from "../../../../elements/mixin/localize/localize-mixin";
import {flexStyle} from '../../../../style/layout-style';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-dialog/paper-dialog';

import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperTimelineItem extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
                ${flexStyle}
                <style>
                    :host {
                        display: block;
                        width: 200px;
                    }
        
                    .data {
                        width: 100%;
                    }
        
                    paper-card {
                        height: 40px;
                        width: 200px;
                    }
        
                    .dataWrapper {
                        padding-left: 6px;
                        padding-right: 6px;
                    }
        
                    paper-listbox {
                        min-width: 0;
                    }
        
                    paper-menu-button {
                        padding: 0;
                    }
        
                    .time {
                        font-style: italic;
                    }
        
                    paper-dialog {
                        margin: 0;
                        margin-top: 6px;
                        padding: 8px;
                        min-width: 200px;
                    }
        
                    paper-dialog div {
                        font-size: 18px;
                    }
        
        
                    paper-dialog div.title {
                        font-size: 20px;
                    }
        
                    .no-thickness {
                        margin: 0;
                        padding: 0;
                    }
                    
                </style>
                <paper-card>
                    <div class="goal-container goal-content layout horizontal">
                        <div class="layout horizontal justified flex-1">
                            <div class="time layout vertical center-center">{{hours}}:{{minutes}}:{{seconds}}</div>
                            <div class="layout vertical center-center">{{count}}</div>
                        </div>
                        <div class="layout horizontal">
                            <paper-icon-button icon="timeline:list" on-tap="openDialog"></paper-icon-button>
                            <paper-menu-button ignore-select disabled="{{hideCrud}}">
                                <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                <paper-listbox slot="dropdown-content" multi>
                                    <paper-item on-click="_remove">{{localize('delete')}}</paper-item>
                                </paper-listbox>
                            </paper-menu-button>
                        </div>
                    </div>
                    <paper-dialog id="timelineItemDialog"  no-overlap horizontal-align="right" vertical-align="top" entry-animation="scale-up-animation" exit-animation="fade-out-animation">
                        <div class="title no-thickness">{{localize('timeslot')}}</div>
                        <template id="repeatTimeslot" is="dom-repeat" items="[[timelineItem.timeslotReferences]]" as="timeslotReference">
                            <div class="flex flex-horizontal no-thickness ">
                                <div class=" flex flex-1 flex-vertical-center">{{timeslotReference.name}}</div>
                                <paper-icon-button icon="timeline:remove" ref={{timeslotReference}} on-click="_removeReference"></paper-icon-button>
                            </div>
                        </template>
                    </paper-dialog>
                </paper-card>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties() {
        return {

            services : {
                value : {
                    _localizeService: 'Localize'
                }
            },

            timelineItem: {
                type: Object,
                notify : true,
                observer: '_changeTimelineItem'
            },

            count: {
                type: Number,
                notify: true
            },

            hours: {
                type: Number,
                notify: true
            },

            minutes: {
                type: Number,
                notify: true
            },

            seconds: {
                type: Number,
                notify: true
            },

            identifier: {
                readOnly: true,
                notify: true,
                reflectToAttribute : true,
            }
        };
    }

    /**
     *
     */
    connectedCallback() {
        super.connectedCallback();
        this._setIdentifier(this.timelineItem.time.toString());
    }

    /**
     * @param newValue
     */
    _changeTimelineItem(newValue) {
        if (!newValue) {
            return;
        }

        this.updateData();
    }

    /**
     *
     */
    updateData() {
        this.count = this._computeCount();
        this.hours = this._computeHours();
        this.minutes = this._computeMinutes();
        this.seconds = this._computeSeconds();
        this.$.repeatTimeslot.render();
    }

    /**
     * @private
     * @return {*}
     */
    _computeCount() {
        if (!this.timelineItem.time) {
            return '00';
        }
        return this.timelineItem.timeslotReferences.length;
    }

    /**
     * @private
     * @return {*}
     */
    _computeHours() {
        if (!this.timelineItem.time) {
            return '00';
        }

        return this.timelineItem.time.getHours() < 10 ? `0${this.timelineItem.time.getHours()}` : this.timelineItem.time.getHours();
    }

    /**
     * @private
     * @return {*}
     */
    _computeMinutes() {
        if (!this.timelineItem.time) {
            return '00';
        }

        return this.timelineItem.time.getMinutes() < 10 ? `0${this.timelineItem.time.getMinutes()}` : this.timelineItem.time.getMinutes();
    }

    /**
     * @private
     * @return {*}
     */
    _computeSeconds() {
        if (!this.timelineItem.time) {
            return '';
        }

        return this.timelineItem.time.getSeconds() < 10 ? `0${this.timelineItem.time.getSeconds()}` : this.timelineItem.time.getSeconds();
    }

    /**
     * @param evt
     * @private
     */
    _remove(evt) {
        this.dispatchEvent(new CustomEvent('remove',
            {detail: {
                    timelineItem: this.timelineItem,
                    timeslotReference: null
                }
            }));
    }

    /**
     * @param evt
     * @private
     */
    _removeReference(evt) {
        this.dispatchEvent(new CustomEvent('remove-reference', {
            detail: {
                timelineItem: this.timelineItem,
                timeslotReference: evt.target.ref
            }
        }));
    }

    /**
     *
     */
    openDialog(evt) {
        this.$.timelineItemDialog.open();
    }
}
window.customElements.define('paper-timeline-item', PaperTimelineItem);
