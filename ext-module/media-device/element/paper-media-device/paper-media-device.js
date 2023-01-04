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
    
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-ripple/paper-ripple.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-flex-layout/iron-flex-layout.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));

    /**
     * @customElement
     * @polymer
     */
    class PaperMediaDevice extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

        static get template() {
            return html`
                <style >
                    paper-card {
                        @apply --layout-horizontal;
                        @apply --application-paper-card;
                        margin-right: 4px;
                        margin-bottom: 4px;
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
                
        
                </style>
                <paper-card>
                    <div id="leftSection"></div>
                    <div id="rightSection">
                        <div id="content">
                            <div class="name">{{entity.name}}</div>
                            <div class="size">
                                <div>{{entity.type}} {{entity.deviceName}}</div>
                            </div>
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
                 * @type object
                 */
                services : {
                    value : {
                        _localizeService: 'Localize',
                        StorageContainerAggregate: {
                            "_storage" : "MediaDeviceStorage"
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
                }
            }
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
    window.customElements.define('paper-media-device', PaperMediaDevice);
})()