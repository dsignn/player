import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../../../elements/mixin/service/injector-mixin";
import {LocalizeMixin} from "../../../../elements/mixin/localize/localize-mixin";
import {StorageEntityMixin} from "../../../../elements/mixin/storage/entity-mixin";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-menu-button/paper-menu-button';
import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperTimer extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                    min-height: 140px;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    @apply --application-paper-card-left-content;
                }
                
                #right-section {
                    @apply --layout-vertical;
                    @apply --layout-flex;
                }
                                
                #right-section .top {
                    @apply --layout-horizontal;
                    @apply --layout-flex;
                }
                
                .content-action {
                    border-top: 1px solid  var(--divider-color);
                    padding: 6px 10px;
                }
                
                
                #leftSection {
                    width: 80px;
                    min-height: 120px;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                    @apply --application-paper-card-left-content;
                }
                
                #fastAction {
                    border-right: 1px solid var(--divider-color);
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
                
                paper-icon-button[disabled].action {
                    background-color: grey;
                    opacity: 0.5;
                }
    
                paper-icon-button[disabled] {
                    color: var(--disabled-text-color);
                    opacity: 0.5;
                }
    
                div[hidden] {
                    visibility: hidden;
                }
                
                paper-icon-button.circle-small {
                     @apply --application-paper-icon-button-circle;
                }
                
                .running {
                    color: var(--timer-running, var(--timeslot-running, green));
                    font-style: italic;
                }
    
                .idle {
                    color: var(--timer-idle, var(--timeslot-idle, red));
                    font-style: italic;
                }
    
                .pause {
                    color: var(--timer-pause, var(--timeslot-pause, yellow));
                    font-style: italic;
                }
                
                paper-icon-button[disabled].action {
                    background-color: grey;
                    opacity: 0.5;
                }
    
                paper-icon-button[disabled] {
                    color: var(--disabled-text-color);
                    opacity: 0.5;
                }
                
                paper-icon-button.circle-small {
                     @apply --application-paper-icon-button-circle;
                }
    
            </style>
            <paper-card>
                <div id="left-section"></div>
                <div id="right-section">
                    <div class="top">
                        <div id="content">
           
                            <div class="name">{{entity.name}}</div>
                            <div id="status">{{entity.status}}</div>
                            <div class="size">
                                <div>{{currentTime}} | {{totalTime}}</div>
                            </div>
                        </div>
                        <div id="crud">
                        <paper-menu-button ignore-select horizontal-align="right">
                            <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                            <paper-listbox slot="dropdown-content" multi>
                                <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                            </paper-listbox>
                        </paper-menu-button>
                    </div>
                    </div>
                    <div class="content-action">
                        <paper-icon-button id="play" icon="timeslot:play" class="circle-small action" on-click="_play"></paper-icon-button>
                        <paper-tooltip for="play" position="bottom">{{localize('play-timer')}}</paper-tooltip>
                        <paper-icon-button id="stop" icon="timeslot:stop" class="circle-small action" on-click="_stop"></paper-icon-button>
                        <paper-tooltip for="stop" position="bottom">{{localize('stop-timer')}}</paper-tooltip>
                        <paper-icon-button id="pause" icon="timeslot:pause" class="circle-small action" on-click="_pause"></paper-icon-button>
                        <paper-tooltip for="pause" position="bottom">{{localize('stop-pause')}}</paper-tooltip>
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
             * @type TimeslotEntity
             */
            entity : {
                observer: '_entityChanged'
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        "_storage" : "TimerStorage"
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

            autoUpdateEntity: {
                type: Boolean,
                value: true
            },

            /**
             * @type number
             */
            currentTime : {
                type: Number,
                notify: true,
                value: 0
            },


            /**
             * @type number
             */
            totalTime : {
                type: Number,
                notify: true,
                value: 0
            },
        }
    }

    /**
     * @param newValue
     */
    _entityChanged(newValue) {
        if (!newValue) {
            return;
        }

        this.currentTime = this.entity.status === TimerEntity.STATUS_IDLE ? this.entity.startAt.toString() : this.entity.timer.toString();
        this.totalTime = this.entity.endAt.toString();
        this._updateActionHtml();
        this._clearStatusClass(this.entity.status);
    }

    /**
     * @private
     */
    _updateActionHtml() {
        switch (true) {
            case this.entity.status === TimerEntity.STATUS_RUNNING:
                this.hideCrud = true;

                this.$.play.disabled = true;
                this.$.stop.disabled = false;
                this.$.pause.disabled = false;
                break;
            case this.entity.status === TimerEntity.STATUS_PAUSE:

                this.hideCrud = true;

                this.$.play.disabled = false;
                this.$.stop.disabled = false;
                this.$.pause.disabled = true;
                break;
            default:
                this.hideCrud = false;

                this.$.play.disabled = false;
                this.$.stop.disabled = true;
                this.$.pause.disabled = true;
        }
    }


    /**
     * @param {string} classString
     */
    _clearStatusClass(classString) {
        this.$.status.className = '';
        this.$.status.classList.add(classString);
    }


    /**
     * @param evt
     * @private
     */
    _remove(evt) {
        this.dispatchEvent(new CustomEvent('remove', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _update(evt) {
        this.dispatchEvent(new CustomEvent('update-view', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _play(evt) {
        if (this.entity.status === TimerEntity.STATUS_IDLE) {
            this.dispatchEvent(new CustomEvent('play', {detail: this.entity}));
        } else {
            this.dispatchEvent(new CustomEvent('resume', {detail: this.entity}));
        }
    }

    /**
     * @param evt
     * @private
     */
    _pause(evt) {
        this.dispatchEvent(new CustomEvent('pause', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _stop(evt) {
        this.dispatchEvent(new CustomEvent('stop', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _update(evt) {
        this.dispatchEvent(new CustomEvent('update', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _delete(evt) {
        this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
    }
}
window.customElements.define('paper-timer', PaperTimer);
