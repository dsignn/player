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
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog/paper-dialog.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));

    /**
     * @customElement
     * @polymer
     */
    class PaperSoccer extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                        min-height: 120px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                    }
                    
                    #fastAction {
                        border-right: 1px solid var(--divider-color);
                    }
                    
                    #fastAction .action {
                        height: 30px;
                        @apply --layout;
                        @apply --layout-center
                        @apply --layout-center-justified;
                    }
                    
                    #rightSection {
                        @apply --layout-horizontal;
                        @apply --layout-flex;
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
                    
                    .name {
                        overflow: hidden;
                        height: 20px;
                    }
                    
                    .dimension, 
                    .size,
                    .video {
                        padding-top: 4px;
                        font-size: 14px;
                        font-style: italic;
                    }
                    
                    .imgBackground {
                        background-image: url("../../module/resource/element/paper-resource/img/image.jpeg") !important;
                    }
        
                    .videoBackground {
                        background-image: url("../../module/resource/element/paper-resource/img/video.jpeg") !important;
                    }
        
                    .webBackground {
                        background-image: url("../../module/resource/element/paper-resource/img/web.jpeg") !important;
                    }
        
                    .audioBackground {
                        background-image: url("../../module/resource/element/paper-resource/img/audio.jpeg") !important;
                    }

        
                </style>
                <paper-card>
                    <div id="left-section"></div>
                    <div id="fastAction">
                        <div class="action">
                        </div>
                    </div>
                    <div id="rightSection">
                        <div id="content">
                            <div class="name">{{entity.name}}</div>
                        </div>
                        <div id="crud">
                            <paper-menu-button id="crudButton" ignore-select horizontal-align="right">
                                <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                <paper-listbox slot="dropdown-content" multi>
                                    <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                    <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                                </paper-listbox>
                            </paper-menu-button>
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
                 * @type FileEntity
                 */
                entity: {
            //      observer: '_entityChanged'
                },

                /**
                 * @type true
                 */
                autoUpdateEntity: {
                    value: true
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _application: 'Application',
                        _localizeService: 'Localize',
                        _resourceService : "ResourceService",
                        StorageContainerAggregate: {
                            "_storage":"ResourceStorage"
                        }
                    }
                },

                _application: {
                    type: Object,
                    readOnly: true,
                    observer: '_applicationChanged'
                },

                /**
                 * @type StorageInterface
                 */
                _storage: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type ResourceService
                 */
                _resourceService: {
                    type: Object,
                    readOnly: true
                }
            }
        }

        /**
         * @param {Application} service 
         * @returns 
         */
        _applicationChanged(service) {
            if (!service) {
                return;
            }

            this.$['left-section'].style.backgroundImage =  `url("${service.getAdditionalModulePath()}/soccer/element/paper-soccer/img/cover.png")`;
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
    window.customElements.define('paper-soccer', PaperSoccer);

})()
