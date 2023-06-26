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
    
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-checkbox/paper-checkbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-form/iron-form.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-icon/iron-icon.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-button/paper-button.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-input/paper-input.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tooltip/paper-tooltip.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-flex-layout/iron-flex-layout.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-autocomplete/paper-autocomplete.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-chip/paper-chips.js`));

    /**
     * @customElement
     * @polymer
     */
    class TcpSourceViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

        static get template() {
            return html`
                    ${flexStyle}
                    <style>
                        div#container {
                            margin-top: 8px;
                        }
                        
                        #monitorUpdate paper-monitor-update {
                        margin-bottom: 4px;
                        }
                                            
                        #content-left {
                            padding-right: 8px;
                        }
                    
                        paper-card.container {
                            @apply --paper-card-container;
                        }
                        
                        iron-icon.info {
                            @apply --info-cursor;
                        }
                    
                        @media (max-width: 900px) {
                        
                        }
                            
                        @media (min-width: 901px) {
                            
                        }
                    </style>
                    <slot name="header"></slot>
                    <iron-form id="formPlaylist">
                        <form method="post">
                            <div id="container">
                                <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                <paper-input id="port" name="port" label="{{localize('port')}}" value="{{entity.port}}" required></paper-input>
                                <paper-input id="ip" name="ip" label="{{localize('ip')}}" value="{{entity.ip}}" required></paper-input>    
                                <paper-input type="number" id="interval" name="interval" label="{{localize('interval')}}" value="{{entity.interval}}" required></paper-input>    
                                <div class="layout-horizontal layout-end-justified">
                                    <paper-button on-tap="submitPlaylistButton">{{localize('save')}}</paper-button>
                                </div>
                            </div>
                        </form>
                    </iron-form>
            `;
        }

        static get properties () {
            return {

                /**
                 * @type PlaylistEntity
                 */
                entity: {
                    observer: '_changeEntity',
                    value: {}
                },

                /**
                 * @type number
                 */
                selected: {
                    type: Number,
                    value: 0
                },

                /**
                 * @type string
                 */
                labelAction: {
                    type: String,
                    value: 'save'
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _notify : "Notify",
                        _localizeService: 'Localize',
                        "HydratorContainerAggregate" : {
                            _tcpSourceHydrator : "TcpSourceHydrator"
                        },
                        StorageContainerAggregate : {
                            _storage :"TcpSourceStorage"
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
                _timeslotStorage: {
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
            this.$.formPlaylist.addEventListener('iron-form-presubmit', this.submitPlaylist.bind(this));
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
            }
        }

        /**
         * @param evt
         * @private
         */
        _searchTimeslot(evt) {
            // TODO cotroll papar autocomplete
            if (!this._timeslotStorage || !evt.detail.value) {
                return;
            }
            
            // TODO filter fot monitor id
            this._timeslotStorage.getAll({name : evt.detail.value.text})
                .then((timeslots) => {

                    evt.detail.target.suggestions(
                        timeslots
                    );
                });
        }

        /**
         * @param evt
         * @private
         */
        _selectTimeslot(evt) {

            this.entity.appendTimeslot(evt.detail.value);
            // this.set('entity.timeslots', this.entity.timeslots);
            //this.$.listTimeslot.notifyPath('items');
            // TODO better solution.
            this.$.listTimeslot.shadowRoot.querySelector('dom-repeat').render();

            setTimeout(
                function () {
                    this.clear();
                }.bind(evt.target),
                300
            );
        }

        /**
         * @param evt
         * @private
         */
        _selectBindPlaylist(evt) {
            this.push('entity.binds', evt.detail.value);

            setTimeout(
                function () {
                    this.clear();
                }.bind(evt.target),
                300
            );
        }

        /**
         * @param evt
         * @private
         */
        _searchBindPlaylist(evt) {
            // TODO cotroll papar autocomplete
            if (!this._storage || !evt.detail.value) {
                return;
            }

            this._storage.getAll({name : evt.detail.value.text})
                .then((filter) => {

                    let reference;
                    for (let cont =  0; filter.length > cont; cont++) {
                        reference = new (require("@dsign/library").storage.entity.EntityNestedReference)();
                        reference.setCollection('playlist');
                        reference.setId(filter[cont].id);
                        reference.name = filter[cont].name;
                        filter[cont] = reference;
                    }

                    evt.detail.target.suggestions(
                        filter
                    );
                });
        }

        /**
         * @param evt
         */
        submitPlaylistButton(evt) {
            this.$.formPlaylist.submit();
        }

        /**
         * @param evt
         */
        submitPlaylist(evt) {
            evt.preventDefault();

            let method = this.getStorageUpsertMethod();
            this._storage[method](this.entity)
                .then((data) => {

                    if (method === 'save') {
                        this.entity = this._storage.getHydrator().hydrate({});
                        this.$.formPlaylist.reset();
                    }

                    this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
                });

        }
    }
    window.customElements.define('tcp-source-view-upsert', TcpSourceViewUpsert);
})()