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
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tooltip/paper-tooltip.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));

    /**
     * @customElement
     * @polymer
     */
    class PaperVideoPanel extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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

                    .name-monitor {
                        font-size: 14px;
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

                    .dimension {
                        display: flex;
                        padding-top: 4px;
                        font-size: 14px;
                    }

                    .dimension > div {
                        padding-right: 4px;
                    }

                    .dimension .name {
                        font-style: italic;
                        font-size: 12px;
                        line-height: 16px;
                    }
        
                </style>
                <paper-card>
                    <div id="left-section"></div>
                    <div id="right-section">
                        <div class="top">
                            <div id="content">
                                <div class="name">{{entity.name}}</div>
                                <div class="name-monitor"> {{nameMonitor}} - {{nameMonitorParent}}</div>
                                <div class="dimension">
                                    <div>
                                        <div class="name">Larghezza</div>
                                        <div>{{entity.videoPanel.width}} px</div>
                                    </div>
                                    <div>
                                        <div class="name">Altezza</div>
                                        <div>{{entity.videoPanel.height}} px</div>
                                    </div>
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
                    </div>
                </paper-card>
            `
        }

        constructor() {
            super();
            this.resources = lang;
        }

        static get properties() {
            return {

                /**
                 * @type object
                 */
                services: {
                    value: {
                        _localizeService: 'Localize',
                        _application: "Application",
                        StorageContainerAggregate: {
                            "_storage": "VideoPanelStorage",
                            "_storageMonitor": "MonitorStorage"
                        }
                    }
                },

                nameMonitor: { },

                nameMonitorParent: { },

                _application: {
                    type: Object,
                    readOnly: true,
                    observer: '_changeApplication',
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
                'changeMonitor(_storageMonitor, entity)'
            ]
        }

        /**
         * @param {Storage} storageMonitor 
         * @param {*} entity 
         */
        changeMonitor(storageMonitor, entity) {
           
            if (!storageMonitor || !entity) {
                return;
            }

            storageMonitor.get(entity.videoPanel.monitorContainerReference.parentId)
                .then((data) => {
                    
                    this.nameMonitorParent = data.name;
                    let monitors = data.getMonitors({nested:true});
                    for (let cont = 0; monitors.length > cont; cont++) {
                        if (monitors[cont].id === entity.videoPanel.monitorContainerReference.id) {
                            this.nameMonitor = monitors[cont].name;
                            break;
                        }

                    }
                });
        }

        _changeApplication(application) {
            if (!application) {
                return;
            }

            this.$['left-section'].style.backgroundImage = `url("${application.additionalModulePath}/video-panel/element/paper-video-panel/img/cover.jpg")`;
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
         * @param evt
         * @private
         */
        _update(evt) {
            this.dispatchEvent(new CustomEvent('update', { detail: this.entity }));
            this.$.crudButton.close();
        }
    }
    window.customElements.define('paper-video-panel', PaperVideoPanel);
})()