(async () => { 

    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { StorageEntityMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/storage/entity-mixin.js`));
    const { lang } = await import('./language.js');
 
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-flex-layout/iron-flex-layout.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tooltip/paper-tooltip.js`));

    /**
     * @customElement
     * @polymer
     */
    class PaperPlaylist extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))  {

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

        static get properties () {
            return {

                /**
                 * @type PlaylistEntity
                 */
                entity : {
                    observer: '_entityChanged'
                },

                /**
                 * @type number
                 */
                currentTime : {
                    notify: true,
                    value: 0
                },

                /**
                 * @type string
                 */
                status : {
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

                services : {
                    value : {
                        _localizeService: 'Localize',
                        StorageContainerAggregate: {
                            _storage: "PlaylistStorage"
                        }
                    }
                },
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
                                    playlist: this.entity,
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
         * @param newValue
         */
        _entityChanged(newValue) {
            if (!newValue) {
                return;
            }

            this.currentTime = this.entity.getCurrentTimeString();
            this.duration = this.entity.getDuration();
            this.status = this.entity.status;
            this._updateActionHtml();
            this._updateContextHtml();
            this._updateRotationHtml();
            this._clearStatusClass(this.entity.status);

            this.$.slider.max =  this.duration;
            this.$.slider.disabled = this.entity.status === 'running' ? false : true;

            if (!this.excludeSlider) {
                this.$.slider.value = this.currentTime;
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

    window.customElements.define('paper-playlist', PaperPlaylist);
})()