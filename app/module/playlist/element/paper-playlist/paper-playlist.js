import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';


/**
 * @customElement
 * @polymer
 */
class PaperPlaylist extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

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
                
                #fastAction {
                    @apply --layout-vertical;
                    border-right: 1px solid var(--divider-color);
                }
                
                #fastAction .action {
                    height: 30px;
                    @apply --layout;
                    @apply --layout-center
                    @apply --layout-center-justified;
                }
                
                #right-section {
                    @apply --layout-vertical;
                    @apply --layout-flex;
                }
                
                #right-section .top {
                    @apply --layout-horizontal;
                    @apply --layout-flex;
                }
                
                
                #content {
                    @apply --layout-flex;
                    padding: 4px;
                }  
                   
                paper-menu-button {
                    padding: 0;
                }
                
                .nameTimeslot {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
    
                paper-listbox {
                    min-width: 0;
                }
    
                #rightSection {
                    background-image: url("img/timslot.jpg") !important;
                }
    
                .activePaperButton {
                    color: forestgreen;
                }
    
                paper-icon-button#rotationIcon[aria-disabled="true"] {
                    opacity: 0.4;
                }
    
                .running {
                    color: var(--timeslot-running);
                    font-style: italic;
                }
    
                .idle {
                    color: var(--timeslot-idle);
                    font-style: italic;
                }
    
                .pause {
                    color: var(--timeslot-pause);
                    font-style: italic;
                }
    
                .content-action {
                    border-top: 1px solid  var(--divider-color);
                    padding: 6px 10px;
                }
    
                .crud paper-icon-button {
                    background-color: #0b8043 ;
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
    
            </style>
            <paper-card>
                <div id="left-section"></div>
                <div id="fastAction">
                    <paper-icon-button id="contextIcon" item="{{timeslot}}" class="activePaperButton" on-tap="_tapOverlay" disabled="{{hideCrud}}"></paper-icon-button>
                    <paper-tooltip for="contextIcon" position="right"></paper-tooltip>
                    <paper-icon-button id="rotationIcon" item="{{timeslot}}" class="activePaperButton" on-tap="_tapRotation" disabled="{{hideCrud}}"></paper-icon-button>
                    <paper-tooltip for="rotationIcon" position="right"></paper-tooltip>
                </div>
                <div id="right-section">
                    <div class="top">
                       <div id="content">
                            <div class="dataWrapper">
                                <div class="nameTimeslot">{{entity.name}}</div>
                                <div id="status">{{status}}</div>
                                <div class="flex flex-horizontal-end">{{entity.monitorContainerReference.name}}</div>
                                <div class="flex flex-horizontal-end">{{currentTime}} / {{entity.duration}} sec</div>
                            </div>
                        </div>
                        <div id="crud" hidden$="[[removeCrud]]">
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
                        <paper-icon-button id="play" icon="timeslot:play" on-click="_play" class="circle-small action"></paper-icon-button>
                        <paper-tooltip for="play" position="bottom">{{localize('play-timeslot')}}</paper-tooltip>
                        <paper-icon-button id="stop" icon="timeslot:stop" on-click="_stop" class="circle-small action"></paper-icon-button>
                        <paper-tooltip for="stop" position="bottom">{{localize('stop-timeslot')}}</paper-tooltip>
                        <paper-icon-button id="pause" icon="timeslot:pause" on-click="_pause" class="circle-small action"></paper-icon-button>
                        <paper-tooltip for="pause" position="bottom">{{localize('pause-timeslot')}}</paper-tooltip>
                    </div>
                </div>
            </paper-card>
        `
    }

    /**
     * @return {Array}
     */
    static get LIST_ROTATION() {
        return [
            'rotation-no',
            'rotation-loop',
            'rotation-infinity'
        ];
    }

    /**
     * @return {Object}
     */
    static get LIST_ROTATION_LABEL_ICON() {
        let obj = {};
        obj['rotation-no'] = 'send-standalone';
        obj['rotation-loop'] = 'send-loop';
        obj['rotation-infinity'] = 'send-imfinity';
        return obj;
    }

    /**
     * @return {Object}
     */
    static get LIST_CONTEXT_LABEL_ICON() {
        let obj = {};
        obj['overlay'] = 'send-overlay';
        obj['standard'] = 'send-standard';
        return obj;
    }

    static get properties () {
        return {
            services : {
                value : {
                    "StorageContainerAggregate": {
                        "playlustStorage":"TimeslotStorage"
                    }
                }
            },

            playlustStorage : {
                observer: 'observerStorageToUpdateEntity'
            },

            entity : {
                observer: '_entityChanged'
            },

            currentTime : {
                notify: true,
                value: 0
            },

            status : {
                notify: true
            },

            hideCrud : {
                type: Boolean,
                notify: true,
                value: false
            },

            removeCrud: {
                type: Boolean,
                notify: true,
                value: false
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     *
     */
    connectedCallback() {
        super.connectedCallback();
        this.root.querySelector('paper-tooltip[for="contextIcon"]').innerText = this.localize(
            PaperPlaylist.LIST_CONTEXT_LABEL_ICON[this.entity.context]
        );
        this.root.querySelector('paper-tooltip[for="rotationIcon"]').innerText = this.localize(
            PaperPlaylist.LIST_ROTATION_LABEL_ICON[this.entity.rotation]
        );
    }


    /**
     * @param newValue
     */
    _entityChanged(newValue) {
        if (!newValue) {
            return;
        }

     //   this.currentTime = this.entity.getCurrentTimeString();
        this.status = this.entity.status;
        this._updateActionHtml();
        this._updateContextHtml();
        this._updateRotationHtml();
        this._clearStatusClass(this.entity.status);
    }

    /**
     * @private
     */
    _updateActionHtml() {
        switch (true) {
            case this.entity.status === 'running':
                this.hideCrud = true;
                this.$.contextIcon.disabled = true;
                this.$.rotationIcon.disabled = true;

                this.$.play.disabled = true;
                this.$.stop.disabled = false;
                this.$.pause.disabled = this.entity.rotation === 'rotation-infinity' ? true : false;
                break;
            case this.entity.status === 'pause':

                this.hideCrud = false;
                this.$.contextIcon.disabled = false;
                this.$.rotationIcon.disabled = false;

                this.$.play.disabled = false;
                this.$.stop.disabled = false;
                this.$.pause.disabled = true;
                break;
            default:
                this.hideCrud = false;
                this.$.contextIcon.disabled = false;
                this.$.rotationIcon.disabled = false;

                this.$.play.disabled = false;
                this.$.stop.disabled = true;
                this.$.pause.disabled = true;
        }
    }

    /**
     * @private
     */
    _updateContextHtml() {
        this.$.contextIcon.icon = `timeslot:${this.entity.context}`;
        this.root.querySelector('paper-tooltip[for="contextIcon"]').innerText = this.localize(
            PaperPlaylist.LIST_CONTEXT_LABEL_ICON[this.entity.context]
        );
    }

    /**
     * @private
     */
    _updateRotationHtml() {
        this.$.rotationIcon.icon = `timeslot:${this.entity.rotation}`;
        this.root.querySelector('paper-tooltip[for="rotationIcon"]').innerText = this.localize(
            PaperPlaylist.LIST_ROTATION_LABEL_ICON[this.entity.rotation]
        );
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
    _tapRotation(evt) {

        let index = PaperPlaylist.LIST_ROTATION.findIndex((items) => {
            return items === this.entity.rotation;
        });

        this.entity.rotation = (index < (PaperPlaylist.LIST_ROTATION.length - 1)) ? PaperPlaylist.LIST_ROTATION[index+1] : PaperPlaylist.LIST_ROTATION[0];
        this.dispatchEvent(new CustomEvent('change-rotation', {detail: this.entity}));
        this._updateRotationHtml();
    }

    /**
     * @param evt
     * @private
     */
    _tapOverlay(evt) {
        this.entity.context = this.entity.context === 'standard' || !this.entity.context ? 'overlay' : 'standard';
        this.dispatchEvent(new CustomEvent('change-context', {detail: this.entity}));
        this._updateContextHtml();
    }

    /**
     * @param evt
     * @private
     */
    _play(evt) {
        if (this.entity.status === TimeslotEntity.IDLE) {
            this.dispatchEvent(new CustomEvent('play', {detail: this.entity}));
        } else {
            this.dispatchEvent(new CustomEvent('resume', {detail: this.entity}));
        }
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
    _pause(evt) {
        this.dispatchEvent(new CustomEvent('pause', {detail: this.entity}));
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

window.customElements.define('paper-playlist', PaperPlaylist);
