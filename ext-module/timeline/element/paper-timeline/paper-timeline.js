
(async () => { 

    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { StorageEntityMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/storage/entity-mixin.js`));
    const {Time} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/date/Time.js`));
    const { flexStyle } = await import(`${container.get('Application').getBasePath()}style/layout-style.js`);
    const { lang } = await import('./language.js');

    const { TimelineService } = await import(`./../../src/TimelineService.js`);
    
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-slider/paper-slider.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tooltip/paper-tooltip.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-icon-button/paper-icon-button.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog/paper-dialog.js`));


    /**
     * @customElement
     * @polymer
     */
    class PaperTimeline extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

        static get template() {
            return html`
                    ${flexStyle}
                <style>

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
                    
                    paper-icon-button#rotationIcon[aria-disabled="true"] {
                        opacity: 0.4;
                    }
        
                    paper-icon-button[disabled].action {
                        background-color: grey;
                        opacity: 0.5;
                    }
                            
                    paper-menu-button {
                        padding: 0;
                    }
                    
                    #content {
                        @apply --layout-flex;
                        padding: 4px;
                        word-break: break-all;
                    }
                    
                    .running {
                        color: var(--timeslot-running);
                        font-style: italic;
                    }
        
                    .content-action {
                        border-top: 1px solid  var(--divider-color);
                        padding: 6px 10px;
                    }
        
                    .idle {
                        color: var(--timeslot-idle);
                        font-style: italic;
                    }
        
                    .pause {
                        color: var(--timeslot-pause);
                        font-style: italic;
                    }
                    
                    paper-icon-button.circle-small {
                        @apply --application-paper-icon-button-circle;
                    }
                    
                </style>
                <paper-card>
                    <div id="left-section"></div>   
                    <div id="fastAction">
                        <paper-icon-button id="overlayIcon" item="{{timeline}}" on-tap="_tapContext"></paper-icon-button>
                        <paper-tooltip for="overlayIcon" position="right">TODO</paper-tooltip>
                        <paper-icon-button id="rotationIcon" item="{{timeline}}" on-tap="_tapRotation"></paper-icon-button>
                        <paper-tooltip for="rotationIcon" position="right">TODO</paper-tooltip>
                    </div>
                    <div id="right-section">
                        <div class="top">
                            <div id="content">
                                <div class="dataWrapper">
                                    <div>{{entity.name}}</div>
                                    <div id="status">{{status}}</div>
                                    <div class="flex flex-horizontal-end">{{currentTime}} | {{total}}</div>
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
                            <paper-tooltip for="play" position="bottom">{{localize('play-timeline')}}</paper-tooltip>
                            <paper-icon-button id="stop" icon="timeslot:stop" on-click="_stop" class="circle-small action"></paper-icon-button>
                            <paper-tooltip for="stop" position="bottom">{{localize('stop-timeline')}}</paper-tooltip>
                            <paper-icon-button id="pause" icon="timeslot:pause" on-click="_pause" class="circle-small action"></paper-icon-button>
                            <paper-tooltip for="pause" position="bottom">{{localize('pause-timeline')}}</paper-tooltip>
                        </div>
                    </div>
            
                </paper-card>
            `
        }

        constructor() {
            super();
            this.resources = lang;
        }

        /**
         * @return {Array}
         */
        static get LIST_ROTATION() {
            return [
                'rotation-no',
                'rotation-loop',
            ];
        }

        /**
         * @return {Object}
         */
        static get LIST_ROTATION_LABEL_ICON() {
            let obj = {};
            obj['rotation-no'] = 'send-standalone';
            obj['rotation-loop'] = 'send-loop';
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
                 * @type TimeslotEntity
                 */
                entity : {
                    observer: '_entityChanged'
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
                 * @type string
                 */
                status : {
                    type: String,
                    notify: true
                },

                /**
                 * @type boolean
                 */
                hideCrud : {
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
                 * @type true
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
                services : {
                    value : {
                        _application: 'Application',
                        _localizeService: 'Localize',
                        StorageContainerAggregate: {
                            _storage: "TimelineStorage"
                        },
                        timelineService: 'TimelineService'
                    }
                },

                _application: {
                    type: Object,
                    readOnly: true,
                    observer: '_applicationChanged'
                },

                timelineService: {
                    readOnly: true,
                    observer: 'timeslotServiceChanged'
                }
            };
        }

        _applicationChanged(service) {
            if (!service) {
                return;
            }

            this.$['left-section'].style.backgroundImage =  `url("${service.getAdditionalModulePath()}/timeline/element/paper-timeline/img/cover.jpeg")`;
        }


        timeslotServiceChanged(service) {
            if (!service) {
                return;
            }
    
            service.getEventManager().on(
                TimelineService.UPDATE_TIME,
                (data) => {
                    
                    if (this.entity.getId() === data.data.getId()) {
                        this.entity.currentTime = data.data.currentTime;
                        this._updateCurrentTime(this.entity);
                
                        this.notifyPath('currentTime');
                    }
                    
                });
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
        sliderUp(evt) {
            // TODO refactor understand if there is better event to attach
            setTimeout(() => {
                    if (this.entity.status === 'running' ) {
                        this.dispatchEvent(new CustomEvent(
                            'timeupdate',
                            {
                                detail:  {
                                    timeline: this.entity,
                                    time: this.$.slider.value
                                }
                            }
                            )
                        )
                    }
                    this._setExcludeSlider(false);
                },
                200
            )
        }

        /**
         * @param evt
         */
        sliderOut(evt) {
            this._setExcludeSlider(false);
        }

        /**
         * @param {TimelineEntity} timeline
         */
        _entityChanged(timeline) {
            if (!timeline) {
                return;
            }
            this.status = timeline.status;
            this._clearStatusClass(timeline.status);
            this._updateContextHtml();
            this._updateRotationHtml();
            this._updateCurrentTime(timeline);
            this._updateTotalTime(timeline);
            this._updateActionHtml();

            this.$.slider.max = this.entity.getDuration();
            this.$.slider.disabled = this.entity.status === 'running' ? false : true;

            if (!this.excludeSlider) {
                this.$.slider.value = this.entity.currentTime;
            }

            if (this.entity.status === 'idle') {
                this.$.slider.dispatchEvent(new Event('mouseup'));
                this.$.slider.value = this.entity.currentTime;
                this.$.slider.disabled = true;
            }

            if (this.entity.status === 'running' || this.entity.status === 'pause') {
                this.$.crudButton.disabled = true;
            } else {
                this.$.crudButton.disabled = false;
            }
        }

        /**
         *
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
        _tapContext(evt) {
            this.entity.context = this.entity.context === 'standard' || !this.entity.context ? 'overlay' : 'standard';
            this.dispatchEvent(new CustomEvent('change-context', {detail: this.entity}));
            this._updateContextHtml();
        }

        /**
         * @param evt
         * @private
         */
        _tapRotation(evt) {
            let index = PaperTimeslot.LIST_ROTATION.findIndex((items) => {
                return items === this.entity.rotation;
            });

            this.entity.rotation = index === 0 ? PaperTimeline.LIST_ROTATION[0] : PaperTimeline.LIST_ROTATION[1];

            this.dispatchEvent(new CustomEvent('change-rotation', {detail: this.entity}));
            this._updateRotationHtml();
        }

        /**
         * @private
         */
        _updateRotationHtml() {
            this.$.rotationIcon.icon = `timeslot:${this.entity.rotation}`;
        }

        /**
         * @private
         */
        _updateContextHtml() {
            this.$.rotationIcon.setAttribute('title', PaperTimeline.LIST_CONTEXT_LABEL_ICON[this.entity.context]);
            this.$.overlayIcon.icon = `timeslot:${this.entity.context}`;
        }

        /**
         * @private
         */
        _updateActionHtml() {
            switch (true) {
                case this.entity.status === 'running':
                    this.hideCrud = true;
                    this.$.overlayIcon.disabled = true;
                    this.$.rotationIcon.disabled = true;

                    this.$.play.disabled = true;
                    this.$.stop.disabled = false;
                    this.$.pause.disabled =false;
                    break;
                case  this.entity.status === 'pause':

                    this.hideCrud = false;
                    this.$.overlayIcon.disabled = false;
                    this.$.rotationIcon.disabled = false;

                    this.$.play.disabled = false;
                    this.$.stop.disabled = false;
                    this.$.pause.disabled = true;
                    break;
                default:
                    this.hideCrud = false;
                    this.$.overlayIcon.disabled = false;
                    this.$.rotationIcon.disabled = false;

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
         * @param {TimelineEntity} entity 
         * @returns 
         */
        _updateCurrentTime(entity) {
            if (!entity) {
                return;
            }

            let currentTime = new Time(0, 0, 0);
            currentTime.sumSeconds(entity.currentTime);
            this.currentTime = currentTime.toString();

            if (!this.excludeSlider) {
                this.$.slider.value = entity.currentTime;
            }
        }

         /**
         * @param {TimelineEntity} entity 
         * @returns 
         */
        _updateTotalTime(entity) {
            if (!entity) {
                return;
            }

            let total = new Time(0, 0, 0);
            total.sumSeconds(entity.getDuration());
            this.total = total.toString();
        }



        /**
         * @private
         */
        _play(evt) {
            if (this.entity.status === 'idle') {
                this.dispatchEvent(new CustomEvent('play', {detail: this.entity}));
            } else {
                this.dispatchEvent(new CustomEvent('resume', {detail: this.entity}));
            }
        }

        /**
         * @private
         */
        _stop(evt) {
            this.dispatchEvent(new CustomEvent('stop', {detail: this.entity}));
        }

        /**
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
            this.$.crudButton.close();
        }

        /**
         * @param evt
         * @private
         */
        _delete(evt) {
            this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
            this.$.crudButton.close();
        }
    }
    window.customElements.define('paper-timeline', PaperTimeline);
})()