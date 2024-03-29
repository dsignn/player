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
    
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-autocomplete/paper-autocomplete.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-chip/paper-chips.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-checkbox/paper-checkbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-input/paper-input.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-ripple/paper-ripple.js`));

    /**
     * @customElement
     * @polymer
     */
    class MediaDeviceViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))  {

        static get template() {
            return html`
                    ${flexStyle}
                    <style>
                        div#container {
                            margin-top: 8px;
                        }
                        
                        paper-card.container {
                            @apply --paper-card-container;
                        }
                        
                        #container {
                                @apply --layout-vertical;
                            }
                        
                            #content-left {
                                @apply --layout-flex;
                            }
                            
                            #content-right {
                                @apply --layout-flex;
                                padding-top: 12px;
                            }
                            
        
                    </style>
                    <slot name="header"></slot>
                    <iron-form id="formResource">
                        <form method="post">
                            <div id="container">
                            <paper-input id="name" name="name" label="Name" value="{{entity.name}}" required></paper-input>
                                <paper-autocomplete
                                        id="mediaDevice"
                                        label="Media device"
                                        text-property="label"
                                        value-property="label"
                                        remote-source
                                        on-autocomplete-selected="_selectMediaDevice"
                                        on-autocomplete-change="_searchMediaDeviceChanged">
                                    <template slot="autocomplete-custom-template">
                                        ${autocompleteStyle}
                                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div index="[[index]]">
                                                <div class="service-name">[[item.label]]</div>
                                                <div class="service-description">[[item.kind]]</div>
                                            </div>
                                            <paper-ripple></paper-ripple>
                                        </paper-item>
                                    </template>
                                </paper-autocomplete>
                            </div>
                            <div>
                                <div class="flex flex-horizontal-end" style="margin-top: 20px;">
                                    <paper-button on-tap="submitEntityButton">{{localize(labelAction)}}</paper-button>
                                </div>
                            </div>
                        </form>
                    </iron-form>
            `;
        }

        static get properties () {
            return {

                /**
                 * @type TimeslotEntity
                 */
                entity: {
                    observer: '_changeEntity',
                    value: {}
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
                            _storage : "MediaDeviceStorage",
                            _resourceStorage: "ResourceStorage"
                        },
                        HydratorContainerAggregate: {
                            _chromeDeviceHydrator : "MediaDeviceEntityChromeApiHydrator"
                        },
                        _monitorService: "MonitorService",
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
                _resourceStorage: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type MonitorService
                 */
                _monitorService: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type MonitorService
                 */
                _chromeDeviceHydrator: {
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
            this.$.formResource.addEventListener('iron-form-presubmit', this.submitResource.bind(this));
        }

        /**
         * @param newValue
         * @private
         */
        _changeEntity(newValue) {
            this.labelAction = 'save';
            if (!newValue) {
                return;
            }

            if (newValue.id) {
                this.labelAction = 'update';
                this.$.mediaDevice.value = !this.$.mediaDevice.value ? this._chromeDeviceHydrator.extract(newValue) : this.$.mediaDevice.value
            }
        }

        /**
         * @param evt
         * @private
         */
        _searchMediaDeviceChanged(evt) {
            navigator.mediaDevices.enumerateDevices()
                .then(function (devices) {
                    let filter = devices.filter(
                        (element) => {
                            return element.label.search(new RegExp(evt.detail.value, 'i')) > -1;
                        }
                    );
                    
                    if (!evt.detail.target) {
                        return
                    }
                    evt.detail.target.suggestions(
                        filter
                    );
                })
                .catch(function (err) {
                    console.error(err);
                });
        }

        /**
         * @param evt
         * @private
         */
        _selectMediaDevice(evt) {
            evt.detail.value.name = this.$.name.value;
            this.entity = this._chromeDeviceHydrator.hydrate(evt.detail.value);
        }

        /**
         * @param evt
         */
        submitEntityButton(evt) {
            this.$.formResource.submit();
        }

        /**
         * @param evt
         */
        submitResource(evt) {
            evt.preventDefault();

            let method = this.getStorageUpsertMethod();
            this._storage[method](this.entity)
                .then((data) => {

                    if (method === 'save') {
                        this.entity = this._storage.getHydrator().hydrate({});
                        this.$.formResource.reset();
                    }

                    this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
                }).catch((err) => {
                        console.log(err)
                    }
                );
        }
    }
    window.customElements.define('media-device-view-upsert', MediaDeviceViewUpsert);
})()