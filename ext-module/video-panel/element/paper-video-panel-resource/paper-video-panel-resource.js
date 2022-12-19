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
                        width: 80px;
                        min-height: 140px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
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
                    <div id="left-section"></div>
                    <div id="right-section">
                        <div class="top">
                            <div id="content">
                                <div class="name">{{entity.resourceReference.name}}</div>
                                <div class="name-video-panel">{{entity.videoPanelResource.videoPanelReference.name}}</div>
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
            `
        }

        constructor() {
            super();
            this.resources = lang;
        }

        static get properties () {
            return {

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _localizeService: 'Localize',
                        _resourceService : "ResourceService",
                        StorageContainerAggregate: {
                            "_storage" : "VideoPanelResourceStorage",
                            "_storageResource": "ResourceStorage"
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
            }
        }

        static get observers() {
            return [
                'changeResource(_storageResource, _resourceService, entity)'
            ]
        }

        changeResource(storageResource, resourceService, entity) {

            if (!storageResource || !resourceService || !entity) {
                return;
            }

            console.log('sucaaaaaaaaaaa', storageResource, entity);
            if (entity.resourceReference.id) {
                storageResource.get(entity.resourceReference.id)
                    .then((resource) => {
                        console.log('DIO CANE', resource);
                    });
            } else {
                // PLACEHODER
            }
       
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
