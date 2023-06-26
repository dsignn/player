
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
    class PaperTcpSource extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))  {

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
                        background-size: 90%;
                        background-position: center;
                        background-repeat: no-repeat;  
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

                    .error {
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

                    .top {
                        display: flex;
                        flex-direction: row;
                        height: 100%;
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
                    <div id="left-section">
                    </div>
                    <div id="right-section">
                        <div class="top">
                            <div id="content">
                                <div class="dataWrapper">
                                    <div class="nameTimeslot">{{entity.name}}</div>
                                    <div id="status">{{status}}</div>
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
                        <div class="content-action">
                            <paper-icon-button id="play" icon="timeslot:play" on-click="_play" class="circle-small action"></paper-icon-button>
                            <paper-tooltip for="play" position="bottom">{{localize('play-timeslot')}}</paper-tooltip>
                            <paper-icon-button id="stop" icon="timeslot:stop" on-click="_stop" class="circle-small action"></paper-icon-button>
                            <paper-tooltip for="stop" position="bottom">{{localize('stop-timeslot')}}</paper-tooltip>
                        </div>
                    </div>
                </paper-card>
            `
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
                        _application: 'Application',
                        _localizeService: 'Localize',
                        StorageContainerAggregate: {
                            _storage: "PlaylistStorage"
                        },
                        _tcpSourceService: 'TcpSourceService'
                    }
                },

                _application: {
                    type: Object,
                    readOnly: true,
                    observer: '_applicationChanged'
                },

                _tcpSourceService: {
                    type: Object,
                    readOnly: true,
                    observer: '_tcpSourceServiceChanged'
                },
            }
        }

        constructor() {
            super();
            this.resources = lang;
        }

        /**
         * @param {Application} service 
         * @returns 
         */
        _applicationChanged(service) {
            if (!service) {
                return;
            }
            this.$['left-section'].style.backgroundImage =  `url("${service.getAdditionalModulePath()}/tcp-source/element/paper-tcp-source/img/cover.png")`;
        }

        _tcpSourceServiceChanged(service) {
 
            service.getEventManager().on('request-error', this._errorTcpSourceService.bind(this));
            service.getEventManager().on('running', this._startTcpSourceService.bind(this));
            service.getEventManager().on('idle', this._stopTcpSourceService.bind(this));
        }

        /**
         * @param {*} evt 
         */
        _errorTcpSourceService(evt) {
            
            if(evt.data.entity.id === this.entity.id) {
                console.log('ERRORRRRRRRRRR', evt.data.entity);
                this.entity = evt.data.entity;
                this._updateEntityChange(this.entity);
            }   
        }

        /**
         * @param {*} evt 
         */
        _startTcpSourceService(evt) {
            console.log('STARTTTTTTTTTTT');
            if(evt.data.id === this.entity.id) {
                console.log('START', evt.data);
                this.entity = evt.data;
                this._updateEntityChange(this.entity);
            }   
        }

        /**
         * @param {*} evt 
         */
        _stopTcpSourceService(evt) {
            console.log('STOPPPPPPPPPPPPP');
            if(evt.data.id === this.entity.id) {
                console.log('STOP', evt.data);
                this.entity = evt.data;
                this._updateEntityChange(this.entity);
            }   
        }

        _entityChanged(entity) {
            this._updateEntityChange(entity);
        }

        _updateEntityChange(entity) {
   
            this.status = entity.status;
            this.$.status.className = '';
            this.$.status.classList.add(entity.status);
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

        /**
         * @param evt
         * @private
         */
        _play() {
            this.dispatchEvent(new CustomEvent('play', {detail: this.entity}));
        }

        /**
         
        * @param evt
         * @private
         */
        _stop() {
            this.dispatchEvent(new CustomEvent('stop', {detail: this.entity}));
        }
    }

    window.customElements.define('paper-tcp-source', PaperTcpSource);
})()