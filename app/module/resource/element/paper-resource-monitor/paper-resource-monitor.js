import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import { StorageEntityMixin } from "@dsign/polymer-mixin/storage/entity-mixin";
import { DurationMixin } from "../mixin/duration-mixin";
import { ActionsMixin } from "../mixin/actions-mixin";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-slider/paper-slider';
import { lang } from './language.js';
import { VideoEntity } from '../../src/entity/VideoEntity';
import { ResourceSenderService } from '../../src/ResourceSenderService';
import { AudioEntity } from '../../src/entity/AudioEntity';

/**
 * @customElement
 * @polymer
 */
class PaperResourceMonitor extends ActionsMixin(DurationMixin(StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))))) {

    static get template() {
        return html`
            <style >
                paper-card {
                    @apply --layout-horizontal;
                    @apply --application-paper-card;
                    margin-right: 4px;
                    margin-bottom: 4px;
                    height: 154px;
                }
                
                #left-section {
                    width: 80px;
                    min-height: 140px;
                    background-size: contain;
                    background-size: 160%;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-image: url("./../../module/resource/element/paper-resource-monitor/img/cover.png");
                    border-right: 1px solid var(--divider-color);
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

                .capitalize {
                    text-transform: capitalize;
                }
                   
                paper-menu-button {
                    padding: 0;
                }
                
                .titleEntity {
                    flex: 1;
                    overflow: hidden;
                    word-wrap: break-word;
                    text-overflow: ellipsis;
                    height: 40px;
                    line-height: 18px;
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

                [status] {
                    font-style: italic;
                    text-transform: capitalize;
                }

                .t-r {
                    text-align: right;
                }

                .h-22 {
                    height:22px;
                }

                .divider{
                    width:10px;
                    display: flex;
                    justify-content: center;
                }
    
                .running {
                    color: var(--timeslot-running);
                }
    
                .idle {
                    color: var(--timeslot-idle);
                }
    
                .pause {
                    color: var(--timeslot-pause);
                }
    
                .content-action {
                    height: 26px;
                    border-top: 1px solid  var(--divider-color);
                    padding: 6px 10px;
                }
    
                .crud paper-icon-button {
                    background-color: #0b8043;
                }
                
                paper-slider {
                    height: 24px;
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
                                <div id="status" status>{{localize(entity.resourceReference.status)}}</div>
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
             */
            entity: {},

            /**
             * @type string
             */
            status: {
                type: String,
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
            removeCrud: {
                type: Boolean,
                notify: true,
                value: false
            },

            /**
             * @type boolean
             */
            autoUpdateEntity: {
                value: true
            },

            /**
             * @type boolean
             */
            excludeSlider: {
                readOnly: true,
                value: false
            },

            /**
             * @type object
             */
            services: {
                value: {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _storage: "ResourceSenderStorage",
                        _storageResource: "ResourceStorage"
                    },
                    resourceSenderService: 'ResourceSenderService'
                }
            },

            resourceSenderService: {
                readOnly: true,
                observer: '_resourceSenderServiceChanged'
            }

        }
    }

    static get observers() {
        return [
            '_entityChanged(entity, _storageResource)'
        ]
    }

    constructor() {
        super();
        this.resources = lang;
        this.addEventListener('update-resource', (evt) => {
            console.log('fffffffffff');
            this.updateDurationEntity();
            this.updateSlider();
            this.updateStatusHtml();
            this.calcTimeDuration();
            this.calcCurrentTime();
            this.updateContextIcons();
            this.updateActionIcons();
        });
    }

    updateEntityCurrentTimeFromService(evt) {
        if (this.entity && evt.data.id !== this.entity.id) {
            return;
        }

        super.updateEntityCurrentTimeFromService(evt);

        if (this._hasDuration()) {
            this.$.slider.disabled = false;
            if (!this.excludeSlider) {
                this.$.slider.value = this.entity.resourceReference.getCurrentTime();
            }
        }
    }

    /**
     * @param {ResourceSenderService} service 
     */
    _resourceSenderServiceChanged(service) {
        if (!service) {
            return;
        }

        service.getEventManager().on(ResourceSenderService.UPDATE_TIME, this.updateEntityCurrentTimeFromService.bind(this));
        service.getEventManager().on(ResourceSenderService.PLAY, this.updateEntityFromService.bind(this));
        service.getEventManager().on(ResourceSenderService.STOP, this.updateEntityFromService.bind(this));
        service.getEventManager().on(ResourceSenderService.PAUSE, this.updateEntityFromService.bind(this));
        service.getEventManager().on(ResourceSenderService.RESUME, this.updateEntityFromService.bind(this));
    }

    /**
     * @param {EntityIdentifier} entity 
     * @param {Storage} storageResource 
     */
    _entityChanged(entity, storageResource) {
        if (!entity || !storageResource) {
            return;
        }

        storageResource.get(entity.resourceReference.id).then((resource) => {
            // TODO hydrate resource
            this.entity.resourceReference = Object.assign(resource, entity.resourceReference);
   
            console.log(this.entity.resourceReference);
            if ((this.entity.resourceReference instanceof MultiMediaEntity)) {
                let promises = [];
                for (let cont = 0; entity.resourceReference.resources.length > cont; cont++) {
                    promises[cont] = storageResource.get(entity.resourceReference.resources[cont].id);
                }

                Promise.all(promises).then((resources) => {
                    for (let cont = 0; resources.length > cont; cont++) {
                        this.entity.resourceReference.resources[cont] = resources[cont];
                    }
                    this.notifyPath('entity');
                    this.dispatchEvent(new CustomEvent('update-resource', this.resourceReference));
                });
            } else {
                this.dispatchEvent(new CustomEvent('update-resource', this.resourceReference));
                this.notifyPath('entity');
            }
        });
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
     * @param {EntityIdentifier} entity 
     * @returns bool
     */
    _hasDuration() {
        var hasPause = false;

        if (!this.entity.resourceReference) {
            return hasPause;
        }

        switch (true) {
            case (this.entity.resourceReference instanceof VideoEntity):
            case (this.entity.resourceReference instanceof AudioEntity):
                hasPause = true
                break;
            case (this.entity.resourceReference instanceof MultiMediaEntity):
                for (let cont = 0; this.entity.resourceReference.resources.length > cont; cont++) {
                    if ((this.entity.resourceReference.resources[cont] instanceof VideoEntity) ||
                        (this.entity.resourceReference.resources[cont] instanceof AudioEntity)) {

                        hasPause = true;
                        break;
                    }
                }
                break;
        }
        return hasPause;
    }

    /**
     * Update duration data visibility
     */
    updateDurationEntity() {
        if (this._hasDuration()) {
            this.$.pause.style.display = 'inline-block';
            this.$.time.style.display = 'flex';
            this.$.rotationIcon.style.display = 'flex';
        } else {
            this.$.pause.style.display = 'none';
            this.$.time.style.display = 'none';
            this.$.rotationIcon.style.display = 'none';
        }
    }

    /**
     * Update slider
     */
    updateSlider() {
        if (this._hasDuration()) {

            this.$.slider.style.display = 'flex';
            this.$.slider.max = this.entity.resourceReference.getDuration();
            if (!this.excludeSlider) {
                this.$.slider.value = this.entity.resourceReference.getCurrentTime();
            }
            this.$.slider.disabled = this.entity.getStatus() === VideoEntity.PLAY ? false : true;

        } else {
           
            this.$.slider.style.display = 'none';
            this.$.slider.disabled = true;
        }
    }

    /**
     * @param {Event} evt
     */
    sliderUp(evt) {
      
        setTimeout(
            () => {
                if (this.entity.getStatus() === VideoEntity.RUNNING ) {
                    this.dispatchEvent(new CustomEvent(
                        'timeupdate',
                        {
                            detail:  {
                                resource: this.entity,
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
     * @private
     */
    updateContextIcons() {
        if (!this.entity.resourceReference) {
            return;
        }

        let context = this.entity.resourceReference.context;

        this.$.contextIcon.icon = `resource:${context}`;
        this.root.querySelector('paper-tooltip[for="contextIcon"]').innerText = this.localize(context);

        let rotation = this.entity.resourceReference.rotation;
        this.$.rotationIcon.icon = `resource:${rotation}`;
        this.root.querySelector('paper-tooltip[for="rotationIcon"]').innerText = this.localize(rotation);

        let adjust = this.entity.resourceReference.adjust;
        this.$.fitIcon.icon = `resource:${adjust}`;
        this.root.querySelector('paper-tooltip[for="fitIcon"]').innerText = this.localize(adjust);

        let volume = this.entity.resourceReference.enableAudio;
        this.$.volumeIcon.icon = `resource:${volume ? 'volume' : 'volume-off'}`;
        this.root.querySelector('paper-tooltip[for="volumeIcon"]').innerText = this.localize(volume ? 'volume' : 'volume-off');

        if (this._hasDuration()) {
            this.$.volumeIcon.style.display = 'flex';
        } else {
            this.$.volumeIcon.style.display = 'none';
        }
    }

    /**
     * @param evt
     * @private
     */
    _tapRotation(evt) {
        if (!this.entity.resourceReference) {
            return;
        }

        let index = PaperResourceMonitor.LIST_ROTATION.findIndex((items) => {
            return items === this.entity.resourceReference.rotation;
        });

        this.entity.resourceReference.rotation = (index < (PaperResourceMonitor.LIST_ROTATION.length - 1)) ? PaperResourceMonitor.LIST_ROTATION[index + 1] : PaperResourceMonitor.LIST_ROTATION[0];
        this.dispatchEvent(new CustomEvent('change-rotation', { detail: this.entity }));
        this.updateContextIcons();
    }

    /**
     * @param evt
     * @private
     */
    _tapOverlay(evt) {
        if (!this.entity.resourceReference) {
            return;
        }

        this.entity.resourceReference.context = this.entity.resourceReference.context === VideoEntity.CONTEXT_STANDARD || !this.entity.resourceReference.context ? 
            VideoEntity.CONTEXT_OVERLAY : VideoEntity.CONTEXT_STANDARD;
        this.dispatchEvent(new CustomEvent('change-context', { detail: this.entity }));
        this.updateContextIcons();
    }

    _tapFit(evt) {
        if (!this.entity.resourceReference) {
            return;
        }

        this.entity.resourceReference.adjust = this.entity.resourceReference.adjust === VideoEntity.SIZE_CONTAIN ? 
            VideoEntity.SIZE_NORMAL : VideoEntity.SIZE_CONTAIN;
        this.dispatchEvent(new CustomEvent('change-adjust', { detail: this.entity }));
        this.updateContextIcons();
    }

    _tapVolume(evt) {
        if (!this.entity.resourceReference) {
            return;
        }


        this.entity.resourceReference.enableAudio = this.entity.resourceReference.enableAudio ? 
            false : true;
        this.dispatchEvent(new CustomEvent('change-volume', { detail: this.entity }));
        this.updateContextIcons();
    }
}

window.customElements.define('paper-resource-monitor', PaperResourceMonitor);