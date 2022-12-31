(async () => {      
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { StorageEntityMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/storage/entity-mixin.js`));
    const { lang } = await import('./language/language.js');

    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-flex-layout/iron-flex-layout.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tooltip/paper-tooltip.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));

    /**
     * @customElement
     * @polymer
     */
    class PaperVideoPanelResource extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                        position: relative;
                        width: 80px;
                        min-height: 140px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                    }

                    #left-section .action {
                        position: absolute;
                        bottom: 6px;
                        right: 6px;
                        z-index: 1;
                    }

                    #left-section video  {
                        object-fit: cover;
                        height: 120px;
                        width: 80px;
                        position: absolute;
                        top: 0;
                        left: 0;
                    }

                    paper-icon-button.circle-small {
                        @apply --application-paper-icon-button-circle;
                        background-color: var(--default-primary-color);
                        color:var(--text-primary-color);
                        height: 30px;
                        width: 30px;
                        padding: 4px;
                      
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

                    .name-video-panel {
                        font-size: 14px;
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
                    <div id="left-section">
                        <div class="action">
                            <paper-icon-button id="previewButton" icon="resource:preview" on-tap="_openPreview" class="circle-small" ></paper-icon-button>
                            <paper-tooltip for="previewButton" position="right" >{{localize('preview-resource')}}</paper-tooltip>
                        </div>
                    </div>
                    <div id="right-section">
                        <div class="top">
                            <div id="content">
                                <div class="name">{{entity.name}}</div>
                                <div class="name-video-panel">{{resource.name}}</div>
                                <div class="name-video-panel">{{entity.videoPanelResource.videoPanelReference.name}} - {{monitor.name}}</div>
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
                    </div>
                </paper-card>
                <paper-dialog id="previewDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation" on-iron-overlay-closed="_closePreview">
                    <div class="title">Preview</div>
                    <paper-dialog-scrollable>
                    <div id="contentPreview"></div>
                    </paper-dialog-scrollable>
                </paper-dialog>`
        }

        constructor() {
            super();
            this.resources = lang;
        }

        static get properties () {
            return {

                resource: {
                    observer: '_changeResource',
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _localizeService: 'Localize',
                        _resourceService : "ResourceService",
                        StorageContainerAggregate: {
                            "_storage" : "VideoPanelResourceStorage",
                            "_storageResource": "ResourceStorage",
                            "_storageMonitor": "MonitorStorage"
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

                /**
                 * @type StorageInterface
                 */
                _storageResource: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type StorageInterface
                 */
                _storageMonitor: {
                    type: Object,
                    readOnly: true
                },

                autoUpdateEntity: {
                    type: Boolean,
                    value: true
                },
            }
        }

        static get observers() {
            return [
                'changeResource(_storageResource, _resourceService, entity)',
                'changeMonitor(_storageMonitor, entity)'
            ]
        }

        /**
         * @param {StorageInterface} storageResource 
         * @param {ResourceService} resourceService 
         * @param {*} entity 
         * @returns 
         */
        changeResource(storageResource, resourceService, entity) {

            if (!storageResource || !resourceService || !entity || !entity.resourceReference || !entity.resourceReference.id) {
                this.resource = null;
                return;
            }

            storageResource.get(entity.resourceReference.id)
                .then((resource) => {
                    if (!resource) {
                        console.warn('paper video panel resource resource not found');
                        return;
                    }
                    this.resource = resource;
                });
        }

        /**
         * @param {StorageInterface} storageMonitor 
         * @param {*} entity 
         * @returns 
         */
        changeMonitor(storageMonitor, entity) {
            if (!storageMonitor || !entity ) {
                this.monitor = null;
                return;
            } 

            this._storageMonitor.get(entity.videoPanelResource.videoPanelReference.parentId)
                .then((monitor) => {
                    this.monitor = monitor;
                });
        }

         /**
         * @private
         */
        _updateLeftImageHtml() {

            switch (true) {
                case this.resource instanceof ImageEntity:
                    this.$['left-section'].style.backgroundImage = `url("${this._resourceService.getResourcePath(this.resource)}")`;
                    break;
                case this.resource instanceof VideoEntity:       

                    let video = document.createElement('video');
                    video.setAttribute('width', 80);
                    video.setAttribute('height', 120);
                    video.setAttribute('preload', 'metadata');

                    let source = document.createElement('source');
                    source.setAttribute('src', `${this._resourceService.getResourcePath(this.resource)}#t=2`);

                    video.appendChild(source);
                    this.$['left-section'].appendChild(video);
                    break;
                case this.resource instanceof AudioEntity:
                    this.$['left-section'].classList.add("audioBackground");
                    break;
                default:
                    this.$['left-section'].classList.add("webBackground");
                    break;
            }
        }

        /**
         * @param evt
         * @private
         */
        _openPreview(evt) {
            let element  = null;
            switch (true) {
                case this.resource instanceof ImageEntity === true:
                    element = document.createElement('img');
                    element.src = this._resourceService.getResourcePath(this.resource)  + '?' + new Date().getTime();
                    break;
                case this.resource instanceof AudioEntity === true:
                case this.resource instanceof VideoEntity === true:
                    element = document.createElement('video');
                    element.src = this._resourceService.getResourcePath(this.resource)  + '?' + new Date().getTime();
                    element.setAttribute('autoplay', true);
                    element.muted = true; // TODO remove for debug
                    element.setAttribute('controls', true);
                    break;
                case this.resource instanceof FileEntity === true:
                    if (!customElements.get(this.resource.wcName)) {

                        import(this._resourceService.getResourcePath(this.resource).replace('.html', '.js'))
                            .then((module) => {
                                element = document.createElement(this.resource.wcName);
                                element.createMockData();
                            }).catch((reason) => {
                                console.error(`Web component ${this.resource.wcName}`, reason);
                            });

                    } else {
                        element = document.createElement(this.resource.wcName);
                        element.createMockData();
                    }
                    break;
            }

            if (element) {
                this._closePreview();
                this.$.contentPreview.append(element);
    
                switch (true) {
                    case element.tagName === 'VIDEO':
                    case element.tagName === 'IMG':
                        element.addEventListener(
                            element.tagName === 'IMG' ? 'load' : 'playing',
                            () => {
                                this.$.previewDialog.open();
                            }
                        );
                        break;
                    default:
                        this.$.previewDialog.open();
                }
    
            }
        }

        /**
         * @private
         */
        _closePreview() {
            let element = this.$.contentPreview.firstChild;

            if (!element) {
                return
            }

            switch (true) {
                case this.resource instanceof AudioEntity === true:
                case this.resource instanceof ImageEntity === true:
                case this.resource instanceof VideoEntity === true:
                    element.src = '';
                    break;
            }
            this.$.contentPreview.innerHTML = '';
        }

        _changeResource(resource) {
            if (!resource) {
                return;
            }

            this._updateLeftImageHtml();
        }

        /**
         * @param evt
         * @private
         */
        _delete(evt) {
            this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
        }

        /**
         * @param evt
         * @private
         */
        _update(evt) {
            this.dispatchEvent(new CustomEvent('update', {detail: this.entity}));
        }
    }
    window.customElements.define('paper-video-panel-resource', PaperVideoPanelResource);
})()
