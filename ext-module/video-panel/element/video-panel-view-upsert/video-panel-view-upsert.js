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
    const { flexStyle } = await import(`${container.get('Application').getBasePath()}style/layout-style.js`);
    const { autocompleteStyle } = await import(`${container.get('Application').getBasePath()}style/autocomplete-custom-style.js`);
      
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-ripple/paper-ripple.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-input/paper-input.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-checkbox/paper-checkbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-chip/paper-chips.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-autocomplete/paper-autocomplete.js`));

    /**
     * @customElement
     * @polymer
     */
    class VideoPanelViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))  {

        static get template() {
            return html`
                    ${flexStyle}
                    <style>
                    
                        .padding-top-8 {
                            padding-top: 8px;;
                        }
                        
                        .padding-4 {
                            padding: 4px;
                        }
                            
                        .padding-right-8 {
                            padding-right: 8px;;
                        }
                        
                        .margin-top-8 {
                            margin-top: 8px;;
                        }
                        
                        .margin-left-16 {
                            margin-left: 16px;;
                        }
                        
                        iron-form {
                            width: 100%;
                        }
                        
                        .padding-4 paper-input {
                            padding-right: 6px;
                        }
                        
                    .paper-panel {
                            padding: 6px;
                            margin-top: 10px;
                            display: flex;
                        }
            
            
                        .paper-panel paper-input,
                        .paper-video-panel paper-input,
                        .paper-panel paper-autocomplete,
                        .paper-video-panel paper-autocomplete{
                            padding-left: 6px;
                        }
            
                        paper-listbox.auto {
                            min-width:initial;
                        }
            
                        .paper-video-panel {
                            margin-left: 30px;
                        }
            
                        .paper-panel,
                        .paper-video-panel {
                            margin-bottom: 8px;
                        }
            
                        #videoPanel {
                            padding: 8px;
                            width: 100%;
                        }
                
                    </style>
                    <slot name="header"></slot>
                    <div class="layout horizontal padding-top-8">
                        <div class="layout horizontal flex-9 padding-right-8">
                            <iron-form id="formEntity">
                                <form method="post">
                                    <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                    <template is="dom-if" if="{{hasVideoPanel}}" >
                                        <paper-card class="layout horizontal padding-4">
                                            <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.videoPanel.name}}" required></paper-input>
                                            <paper-input id="width" name="width" label="{{localize('width')}}" type="number" value="{{entity.videoPanel.width}}" required></paper-input>
                                            <paper-input id="height" name="height" label="{{localize('height')}}" type="number" value="{{entity.videoPanel.height}}" required></paper-input>
                                            <div class="layout horizontal center-center flex">{{entity.videoPanel.monitorContainerReference.name}}</div>
                                            <div class="layout horizontal center-center">
                                                <paper-menu-button ignore-select style="padding: 0">
                                                    <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                                    <paper-listbox slot="dropdown-content" class="auto" multi>
                                                        <paper-item item="{{resource.videoPanel}}"  on-click="_removeVideoPanel">{{localize('delete')}}</paper-item>
                                                    </paper-listbox>
                                                </paper-menu-button>
                                            </div>
                                        </paper-card>
                                        <template submonitor-repeat is="dom-repeat" items="{{entity.videoPanel.videoPanels}}" as="videoPanel">
                                            <paper-card class="layout horizontal padding-4 margin-top-8 margin-left-16">
                                                <paper-input id="name" name="name" label="Name" value="{{videoPanel.name}}" required></paper-input>
                                                <paper-input id="width" name="width" label="Width" type="number" value="{{videoPanel.width}}" required></paper-input>
                                                <paper-input id="height" name="height" label="Height" type="number" value="{{videoPanel.height}}" required></paper-input>
                                                <div class="layout horizontal center-center flex">{{videoPanel.monitorContainerReference.name}}</div>
                                                <div class="layout horizontal center-center">
                                                    <paper-menu-button ignore-select style="padding: 0">
                                                        <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                                        <paper-listbox slot="dropdown-content" class="auto" multi>
                                                            <paper-item item="{{videoPanel}}"  on-click="_removeVideoPanel">{{localize('delete')}}</paper-item>
                                                        </paper-listbox>
                                                    </paper-menu-button>
                                                </div>
                                            </paper-card>
                                        </template>
                                    </template>
                                </form>
                            </iron-form>
                        </div>
                        <div class="layout horizontal flex-3">
                            <paper-card id="videoPanel" heading="{{localize('video-panel')}}">
                                <iron-form id="formVideoPanel">
                                    <form method="post" action="">
                                        <paper-input id="name" name="name" label="{{localize('name')}}" value="{{_videoPanel.name}}" required></paper-input>
                                        <paper-input id="videoPanelHeight" name="height" type="number" label="{{localize('height')}}" value="{{_videoPanel.height}}" required></paper-input>
                                        <paper-input id="videoPanelWidth" name="width" type="number" label="{{localize('width')}}" value="{{_videoPanel.width}}" required></paper-input>
                                        <paper-autocomplete
                                                id="monitorSelector"
                                                label="Monitor"
                                                text-property="name"
                                                value-property="name"
                                                remote-source
                                                _selected-option="{{data}}"
                                                on-autocomplete-selected="_selectMonitor"
                                                on-autocomplete-change="_searchMonitor">
                                            <template slot="autocomplete-custom-template">
                                                ${autocompleteStyle}
                                                <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                                    <div index="[[index]]">
                                                        <div class="service-name">[[item.name]] ([[item.monitorReference.name]]) </div>
                                                        <div class="service-description">
                                                            Width [[item.width]]px Height [[item.height]]px
                                                        </div>
                                                    </div>
                                                    <paper-ripple></paper-ripple>
                                                </paper-item>
                                            </template>
                                        </paper-autocomplete>
                                        <div hidden$="[[!hasVideoPanel]]">
                                            <paper-autocomplete
                                                    id="videoPanelSelector"
                                                    label="Video Panel"
                                                    text-property="name"
                                                    value-property="name"
                                                    remote-source
                                                    _selected-option="{{data}}"
                                                    on-autocomplete-change="_searchVideoPanel">
                                                <template slot="autocomplete-custom-template">
                                                    ${autocompleteStyle}
                                                    <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                                        <div index="[[index]]">
                                                            <div class="service-name">[[item.name]]</div>
                                                            <div class="service-description">{{localize('width')}} [[item.width]]px {{localize('height')}} [[item.height]]px</div>
                                                        </div>
                                                        <paper-ripple></paper-ripple>
                                                    </paper-item>
                                                </template>
                                            </paper-autocomplete>
                                        </div>
                                        <div class="flex flex-horizontal-end">
                                            <paper-button on-tap="submitVideoPanelButton">{{localize('add')}}</paper-button>
                                        </div>
                                    </form>
                                </iron-form>
                            </paper-card> 
                        </div>
                    </div>
                    <div class="flex flex-horizontal-end" style="padding-top: 10px; padding-right: 8px;">
                        <paper-button on-tap="submitEntityButton">{{labelAction}}</paper-button>
                    </div>
            `;
        }

        static get properties () {
            return {

                /**
                 * @type VideoPanelContainerEntity
                 */
                entity: {
                    observer: '_changeEntity',
                    value: {}
                },

                hasVideoPanel: {
                    type: Boolean,
                    notify: true,
                    value: false
                },

                /**
                 * @type string
                 */
                labelAction: {
                    type: String,
                    value: 'save'
                },

                services : {
                    value : {
                        _notify: "Notify",
                        _localizeService: 'Localize',
                        StorageContainerAggregate : {
                            _storage : "VideoPanelStorage",
                            _monitorStorage : "MonitorStorage",
                        },
                        EntityContainerAggregate: {
                            _entityNestedReference : "EntityNestedReference",
                            _entityReference : "EntityReference",
                            _videoPanel : "VideoPanel"
                        },
                        HydratorContainerAggregate: {
                            _videoPanelHydrator: "VideoPanelHydrator"
                        }
                    }
                },

                /**
                 * @type Notify
                 */
                _notify: {
                    type: Object,
                    readOnly: true
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
                _monitorStorage: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type EntityNestedReference
                 */
                _entityNestedReference: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type VideoPanel
                 */
                _videoPanel: {
                    type: Object,
                    readOnly: true
                }
            };
        }

        constructor() {
            super();
            this.resources = lang;
        }

        ready() {
            super.ready();

            this.$.formVideoPanel.addEventListener('iron-form-presubmit', this.submitVideoPanel.bind(this));
            this.$.formEntity.addEventListener('iron-form-presubmit', this.submitEntity.bind(this));
        }

        /**
         * @param newValue
         * @private
         */
        _changeEntity(newValue) {
            this.labelAction = 'save';
            if (!newValue) {
                this.hasVideoPanel = false;
                return;
            }

            if (newValue.id) {
                this.hasVideoPanel = newValue.hasVideoPanel();
                this.labelAction = 'update';
            }
        }

        /**
         * @param evt
         */
        _searchVideoPanel(evt) {
            let filter = this.entity.getVideoPanel().getVideoPanels({nested:true}).filter(
                element => {
                    return element.name.search(new RegExp(evt.detail.value.text, 'i')) > -1;
                }
            );

            evt.detail.target.suggestions(
                filter
            );
        }

        /**
         * @param evt
         */
        _searchMonitor(evt) {

            this._monitorStorage.getAll({name: evt.detail.value.text})
                .then((data) => {
                    let monitors =  [];
                    let tmpMonitors =  [];
                    for (let cont = 0; data.length > cont; cont++) {

                        // TODO check data flow

                        tmpMonitors = monitors.concat(data[cont].getMonitors({nested:true}));
                        for (let nestedCont = 0; tmpMonitors.length > nestedCont; nestedCont++) {

                            tmpMonitors[nestedCont].monitorReference = new (this._entityReference.constructor)()
                            tmpMonitors[nestedCont].monitorReference .setId(data[cont].id);
                            tmpMonitors[nestedCont].monitorReference .collection = 'monitor';
                            tmpMonitors[nestedCont].monitorReference .name = data[cont].name;
                        }

                        monitors = monitors.concat(tmpMonitors);
                    }
                    // TODO check data flow
                    /*
                                if (this.entity.hasVideoPanel()) {
                                    let index = data.findIndex((element) => {
                                        return element.id === this.entity.getVideoPanel().virtualMonitorReference.virtualMonitorId;
                                    });
                                    data = [
                                        data[index]
                                    ];
                                }

                                for (let cont = 0; data.length > cont; cont++) {
                                    let internalMonitor = data[cont].getMonitors({nested: this.entity.hasVideoPanel()});
                                    for (let index = 0; internalMonitor.length > index; index++) {
                                        monitors.push({
                                            monitor: internalMonitor[index],
                                            config: data[cont],
                                            name: internalMonitor[index].name
                                        });
                                    }
                                }
                */
                    evt.detail.target.suggestions(
                        monitors
                    );
                });
        }

        /**
         * @param evt
         */
        _selectMonitor(evt) {
            let ref =  new (this._entityNestedReference.constructor)();
            ref.setParentId(evt.detail.value.monitorReference.getId());
            ref.setId(evt.detail.value.getId());
            ref.setCollection('monitor');
            ref.name = evt.detail.value.name;

            this._videoPanel.monitorContainerReference = ref;
        }

        /**
         * @param evt
         */
        submitVideoPanelButton(evt) {
            this.$.formVideoPanel.submit();
        }

        /**
         * @param evt
         */
        submitVideoPanel(evt) {
            evt.preventDefault();

            this._videoPanel.setId(
                require("@dsign/library").storage.util.MongoIdGenerator.statcGenerateId()
            );

            let videoPanel = this._videoPanelHydrator.hydrate(this._videoPanel);
            if (this.entity.hasVideoPanel()) {
                let videoPanelFound = this.entity.getVideoPanel().getVideoPanel(this.$.videoPanelSelector.value.id);
                videoPanelFound.appendVideoPanel(videoPanel);
            } else {
                this.entity.setVideoPanel(videoPanel);
                this.hasVideoPanel = true;
            }

            this.videoPanel = this._videoPanelHydrator.hydrate({});
            this._resetVideoPanel();
            this.render();
        }

        /**
         *
         */
        render() {
            let elements = this.root.querySelectorAll('dom-repeat');
            for (let cont = 0; elements.length > cont; cont++) {
                elements[cont].render();
            }
        }

        /**
         * @param evt
         */
        submitEntityButton(evt) {
            this.$.formEntity.submit();
        }

        /**
         * @param evt
         */
        submitEntity(evt) {
            evt.preventDefault();

            let method = this.getStorageUpsertMethod();
            this._storage[method](this.entity)
                .then((data) => {

                    if (method === 'save') {
                        this.entity = this._storage.getHydrator().hydrate({});
                        this.$.formEntity.reset();
                    }

                    this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
                });
        }

        /**
         *
         */
        _resetVideoPanel() {
            this.$.formVideoPanel.reset();
            this.$.videoPanelSelector.clear();
            this.$.monitorSelector.clear();
        }

        /**
         *
         */
        _removeVideoPanel(evt) {
            this.entity.getVideoPanel().removeVideoPanel(evt.target.item);
            this.render();
        }
    }
    window.customElements.define('video-panel-view-upsert', VideoPanelViewUpsert);
})()