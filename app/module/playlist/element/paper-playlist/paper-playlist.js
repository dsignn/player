import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import { StorageEntityMixin } from "@dsign/polymer-mixin/storage/entity-mixin";
import { ActionsMixin } from "./../../../resource/element/mixin/actions-mixin"
import { DurationMixin } from "./../../../resource/element/mixin/duration-mixin"
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-tooltip/paper-tooltip';
import { PlaylistService } from './../../src/PlaylistService'


import { lang } from './language/language';
import { PlaylistEntity } from '../../src/entity/PlaylistEntity';


/**
 * @customElement
 * @polymer
 */
class PaperPlaylist extends DurationMixin(ActionsMixin(StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))))) {

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
                
                #right-section {

                    @apply --layout-vertical;
                    @apply --layout-flex;
                }
                
                #right-section .top {
                    @apply --layout-horizontal;
                    @apply --layout-flex;
                }
                
                
                .content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 4px;
                }  

                .sub-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                }

                .row {
                    display: flex;
                    flex-direction: row;
                }

                .center {
                    align-item: center !important;
                }

                .spaces {
                    justify-content: space-between;
                }
                
                
                #content {
                    @apply --layout-flex;
                    padding: 4px;
                }  
                   
                paper-menu-button {
                    padding: 0;
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
                    <paper-icon-button id="contextIcon" class="activePaperButton" on-tap="_tapOverlay"  disabled="{{hideCrud}}"></paper-icon-button>
                    <paper-tooltip for="contextIcon" position="right"></paper-tooltip>
                    <paper-icon-button id="rotationIcon" class="activePaperButton" on-tap="_tapRotation" disabled="{{hideCrud}}"></paper-icon-button>
                    <paper-tooltip for="rotationIcon" position="right"></paper-tooltip>
                    <paper-icon-button id="fitIcon" class="activePaperButton" on-tap="_tapFit" disabled="{{hideCrud}}"></paper-icon-button>
                    <paper-tooltip for="fitIcon" position="right"></paper-tooltip>
                    <paper-icon-button id="volumeIcon" class="activePaperButton" on-tap="_tapVolume" disabled="{{hideCrud}}"></paper-icon-button>
                    <paper-tooltip for="volumeIcon" position="right"></paper-tooltip>
                </div>
                <div id="right-section">
                    <div class="content">
                        <div class="sub-content">
                            <div class="row center">
                                <div class="titleEntity">{{entity.name}}</div>
                                <div id="crud" hidden$="[[removeCrud]]">
                                    <paper-menu-button id="crudButton" ignore-select horizontal-align="right" disabled="{{hideCrud}}">
                                        <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                        <paper-listbox slot="dropdown-content" multi>
                                            <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                            <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                                        </paper-listbox>
                                    </paper-menu-button>
                                </div>
                            </div>
                            <div class="row center spaces h-22">
                                <div id="status" status>{{localize(entity.status)}}</div>
                                <div class="titleEntity t-r capitalize">{{entity.monitorContainerReference.name}}</div>
                            </div>  
                            <div id="time" class="row center h-18">
                                <div id="current-duration">{{currentHour}}:{{currentMinute}}:{{currentSecond}}:{{currentSecondTenths}}</div>
                                <div class="divider">|</div>
                                <div id="duration">{{hour}}:{{minute}}:{{second}}:{{secondTenths}}</div>
                            </div>  
                        </div>
                        <paper-slider id="slider" pin on-mousedown="sliderDown" on-mouseup="sliderUp" on-mouseout="sliderOut" disabled></paper-slider>
                    </div>      
                    <div class="content-action">
                        <paper-icon-button id="play" icon="resource:play" on-click="_play" class="circle-small action"></paper-icon-button>
                        <paper-tooltip for="play" position="bottom">{{localize('play-resource')}}</paper-tooltip>
                        <paper-icon-button id="stop" icon="resource:stop" on-click="_stop" class="circle-small action"></paper-icon-button>
                        <paper-tooltip for="stop" position="bottom">{{localize('stop-resource')}}</paper-tooltip>
                        <paper-icon-button id="pause" icon="resource:pause" on-click="_pause" class="circle-small action"></paper-icon-button>
                        <paper-tooltip for="pause" position="bottom">{{localize('pause-resource')}}</paper-tooltip>
                    </div>
                </div>
            </paper-card>
        `
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
                    },
                    playlistService: 'PlaylistService'
                }
            },

            playlistService: {
                readOnly: true,
                observer: '_playlistServiceChanged'
            }
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
    
            this.status = this.entity.status;
            this.notifyPath('entity.status');
            this.duration = this.entity.getDuration();
            this.calcTimeDuration();
            this.calcCurrentTime();
            this.updateContextIcons();
            this.updateActionIcons();
        });
    }

    _playlistServiceChanged(service) {
        if (!service) {
            return;
        }

        service.getEventManager().on(PlaylistService.UPDATE_TIME, this.updateEntityCurrentTimeFromService.bind(this));
        service.getEventManager().on(PlaylistService.PLAY, this.updateEntityFromService.bind(this));
        service.getEventManager().on(PlaylistService.STOP, this.updateEntityFromService.bind(this));
        service.getEventManager().on(PlaylistService.PAUSE, this.updateEntityFromService.bind(this));
        service.getEventManager().on(PlaylistService.RESUME, this.updateEntityFromService.bind(this));
    }

    updateEntityCurrentTimeFromService(evt) {
        super.updateEntityCurrentTimeFromService(evt);;
        this.updateSlider();
    }

    updateEntityFromService(evt) {
        if (this.entity && evt.data.context.entity.id !== this.entity.id) {
            return;
        }

        this.entity = evt.data.context.entity;
        this.notifyPath('entity.status');
        this.updateStatusHtml();
        this.updateActionIcons();
        this.calcCurrentTime();
        this.updateSlider();
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
     * @param {Event} evt
     */
    sliderDown(evt) {
        this._setExcludeSlider(true);
    }

    /**
     * @param {Event} evt
     */
    sliderOut(evt) {
        this._setExcludeSlider(false);
    }

    /**
     * @param {Event} evt
     */
    sliderUp(evt) {

        setTimeout(
            () => {
                if (this.entity.getStatus() === PlaylistEntity.RUNNING) {
                    console.log('MODIFICA TEMPO');
                    this.dispatchEvent(new CustomEvent(
                        'timeupdate',
                        {
                            detail: {
                                playlist: this.entity,
                                time: this.$.slider.value
                            }
                        }
                    ))
                }
                this._setExcludeSlider(false);
            },
            200
        )
    }

    updateSlider() {

        this.$.slider.max = this.entity.getDuration();
        this.$.slider.disabled = this.entity.getStatus() === PlaylistEntity.RUNNING ? false : true;
        if (!this.excludeSlider) {
            this.$.slider.value = this.entity.getCurrentTime();
        }
    }

    /**
     * Calc duration
     */
    calcTimeDuration() {
        if (!this.entity) {
            return;
        }

        this._setHour(~~(this.entity.getDuration() / 3600));
        this._setMinute(~~((this.entity.getDuration() % 3600) / 60));
        this._setSecond(~~this.entity.getDuration() % 60);

        let splitter = (this.entity.getDuration() + "").split(".");
        this._setSecondTenths(parseInt(splitter[1] ? splitter[1].substring(0, 1) : 0));
    }

    /**
     * Calc current time
     */
    calcCurrentTime() {
        if (!this.entity) {
            return;
        }

        this._setCurrentHour(~~(this.entity.getCurrentTime() / 3600));
        this._setCurrentMinute(~~((this.entity.getCurrentTime() % 3600) / 60));
        this._setCurrentSecond(~~this.entity.getCurrentTime() % 60);

        let splitter = (this.entity.getCurrentTime() + "").split(".");
        this._setCurrentSecondTenths(parseInt(splitter[1] ? splitter[1].substring(0, 1) : 0));
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

    /**
 * @private
 */
    updateContextIcons() {
        if (!this.entity) {
            return;
        }

        let context = this.entity.context;

        this.$.contextIcon.icon = `resource:${context}`;
        this.root.querySelector('paper-tooltip[for="contextIcon"]').innerText = this.localize(context);

        let rotation = this.entity.rotation;
        this.$.rotationIcon.icon = `resource:${rotation}`;
        this.root.querySelector('paper-tooltip[for="rotationIcon"]').innerText = this.localize(rotation);

        let adjust = this.entity.adjust;
        this.$.fitIcon.icon = `resource:${adjust}`;
        this.root.querySelector('paper-tooltip[for="fitIcon"]').innerText = this.localize(adjust);

        let volume = this.entity.enableAudio;
        this.$.volumeIcon.icon = `resource:${volume ? 'volume' : 'volume-off'}`;
        this.root.querySelector('paper-tooltip[for="volumeIcon"]').innerText = this.localize(volume ? 'volume' : 'volume-off');
    }

    /**
     * @param evt
     * @private
     */
    _tapRotation(evt) {
        if (!this.entity) {
            return;
        }

        let index = PaperResourceMonitor.LIST_ROTATION.findIndex((items) => {
            return items === this.entity.rotation;
        });

        this.entity.rotation = (index < (PaperResourceMonitor.LIST_ROTATION.length - 1)) ? PaperResourceMonitor.LIST_ROTATION[index + 1] : PaperResourceMonitor.LIST_ROTATION[0];
        this.dispatchEvent(new CustomEvent('change-rotation', { detail: this.entity }));
        this.updateContextIcons();
    }

    /**
    * @param evt
    * @private
    */
    _tapOverlay(evt) {
        if (!this.entity) {
            return;
        }

        this.entity.context = (this.entity.context === PlaylistEntity.CONTEXT_STANDARD) ?
            PlaylistEntity.CONTEXT_OVERLAY : PlaylistEntity.CONTEXT_STANDARD;
        this.dispatchEvent(new CustomEvent('change-context', { detail: this.entity }));
        this.updateContextIcons();
    }

    _tapFit(evt) {
        if (!this.entity) {
            return;
        }
        this.entity.adjust = this.entity.adjust === PlaylistEntity.SIZE_CONTAIN ?
            PlaylistEntity.SIZE_NORMAL : PlaylistEntity.SIZE_CONTAIN;
        this.dispatchEvent(new CustomEvent('change-adjust', { detail: this.entity }));
        this.updateContextIcons();
    }

    _tapVolume(evt) {
        if (!this.entity) {
            return;
        }


        this.entity.enableAudio = this.entity.enableAudio ? false : true;
        this.dispatchEvent(new CustomEvent('change-volume', { detail: this.entity }));
        this.updateContextIcons();
    }
}

window.customElements.define('paper-playlist', PaperPlaylist);
