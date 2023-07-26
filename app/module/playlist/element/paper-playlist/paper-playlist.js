import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import { StorageEntityMixin } from "@dsign/polymer-mixin/storage/entity-mixin";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-tooltip/paper-tooltip';

import { ActionsMixin } from "./../../../resource/element/mixin/actions-mixin"
import { lang } from './language/language';


/**
 * @customElement
 * @polymer
 */
class PaperPlaylist extends ActionsMixin(StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

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
                    background-size: contain;
                    background-position: center;
                    background-repeat: no-repeat;
                    
                    background-color: #cc66ff;      
                    background-image: url("./../../module/playlist/element/paper-playlist/img/cover.png");      
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
                    color: var(--playlist-running, var(--timeslot-running, green));
                    font-style: italic;
                }
    
                .idle {
                    color: var(--playlist-idle, var(--timeslot-idle, red));
                    font-style: italic;
                }
    
                .pause {
                    color: var(--playlist-pause, var(--timeslot-pause, yellow));
                    font-style: italic;
                }
                
                .content-action {
                    border-top: 1px solid  var(--divider-color);
                    padding: 6px 10px;
                }
    
                .crud paper-icon-button {
                    background-color: #0b8043;
                }
                
                paper-slider {
                    width: 100%;
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
                                <div class="flex flex-horizontal-end">{{currentTime}} / {{duration}} sec</div>
                            </div>
                        </div>
                        <div id="crud" hidden$="[[removeCrud]]">
                            <paper-menu-button id="crudButton" ignore-select horizontal-align="right">
                                <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                <paper-listbox slot="dropdown-content" multi>
                                    <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                    <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                                </paper-listbox>
                            </paper-menu-button>
                        </div>
                    </div>
                    <paper-slider id="slider" pin on-mousedown="sliderDown" on-mouseup="sliderUp" on-mouseout="sliderOut" disabled></paper-slider>
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

    static get properties() {
        return {

            /**
             * @type PlaylistEntity
             */
            entity: {},

            /**
             * @type number
             */
            currentTime: {
                notify: true,
                value: 0
            },

            /**
             * @type string
             */
            status: {
                notify: true
            },

            /**
             * @type boolean
             */
            hideCrud: {
                type: Boolean,
                notify: true,
                value: false
            },

            /**
             * @type boolean
             */
            excludeSlider: {
                readOnly: true,
                value: false
            },

            /**
             * @type true
             */
            autoUpdateEntity: {
                value: true
            },

            /**
             * @type boolean
             */
            removeCrud: {
                type: Boolean,
                notify: true,
                value: false
            },

            services: {
                value: {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _storage: "PlaylistStorage",
                        _resourceStorage: "ResourceStorage"
                    }
                }
            },
        }
    }

    static get observers() {
        return [
            'changeEntity(entity, _resourceStorage)'
        ]
    }

    constructor() {
        super();
        this.resources = lang;
        this.addEventListener('update-resource', (evt) => {
            console.log('update');

            this.status = this.entity.status;
            this.duration = this.entity.getDuration();
            this.updateActionIcons();


        });
    }

    /**
     * @param {PlayerEntity} entity 
     * @param {StorageInterface} storage 
     */
    changeEntity(entity, storage) {
        if (!storage || !entity || !this.entity.resources || this.entity.resources.length < 1) {
            return;
        }

        var resourceLoaded = 0;
        for (let cont = 0; this.entity.resources.length > cont; cont++) {
            this._resourceStorage.get(this.entity.resources[cont].id)
                .then((resource) => {
                    this.entity.resources[cont] = Object.assign(resource, this.entity.resources[cont]);
                    resourceLoaded++
                    if (this.entity.resources.length == resourceLoaded) {
                        this.dispatchEvent(new CustomEvent('update-resource', this.entity));
                    }
                });
        }
    }

    /**
     * @param evt
     * @private
     */
    _update(evt) {
        this.dispatchEvent(new CustomEvent('update', { detail: this.entity }));
        this.$.crudButton.close();
    }

    /**
     * @param evt
     * @private
     */
    _delete(evt) {
        this.dispatchEvent(new CustomEvent('delete', { detail: this.entity }));
        this.$.crudButton.close();
    }
}

window.customElements.define('paper-playlist', PaperPlaylist);
