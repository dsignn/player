(async () => {     
  
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { StorageEntityMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/storage/entity-mixin.js`));
    const { flexStyle } = await import(`${container.get('Application').getBasePath()}style/layout-style.js`);
    const { autocompleteStyle } = await import(`${container.get('Application').getBasePath()}style/autocomplete-custom-style.js`);
    const { lang } = await import('./language.js');
        
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-ripple/paper-ripple.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-input/paper-input.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-checkbox/paper-checkbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-autocomplete/paper-autocomplete.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-chip/paper-chips.js`));

    await import('./../paper-timeline-item/paper-timeline-item.js');  

    /**
     * @customElement
     * @polymer
     */
    class TimelineViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                        
                        
                        .pd-r {
                            padding-right: 6px;
                        }
                        
                        .padding-6 {
                            padding: 6px;
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
                        
                        
                        paper-timeline-item {
                            margin-bottom: 6px;
                            margin-right: 6px;
                            align-self: flex-start
                        }
        
                    </style>
                    <slot name="header"></slot>
                    <iron-form id="formEntity">
                        <form method="post">
                            <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                            <paper-checkbox checked="{{entity.enableAudio}}" style="padding-top: 20px;">{{localize('enable-audio')}} <i>({{localize('info-working')}})</i></paper-checkbox>
                            <div class="layout horizontal" style="width: 100%;">
                                <paper-input label="{{localize('hours-end')}}" class="layout-flex-4" value="{{entity.time.hours}}" type="number" required></paper-input>
                                <div class="pd-r"></div>
                                <paper-input label="{{localize('minutes-end')}}" class="layout-flex-4" value="{{entity.time.minutes}}" type="number" required></paper-input>
                                <div class="pd-r"></div>
                                <paper-input label="{{localize('seconds-end')}}" class="layout-flex-4" value="{{entity.time.seconds}}" type="number" required></paper-input>
                            </div>
                            <div class="layout horizontal">
                                <paper-card class="layout horizontal layout-flex padding-6">
                                    <paper-input class="layout-flex" label="{{localize('hours')}}" value="{{time.hours}}" type="number"></paper-input>
                                    <div class="pd-r"></div>
                                    <paper-input class="layout-flex" label="{{localize('minutes')}}" min="0" max="59" value="{{time.minutes}}" type="number"></paper-input>
                                    <div class="pd-r"></div>
                                    <paper-input class="layout-flex" label="{{localize('seconds')}}" min="0" max="59"  value="{{time.seconds}}" type="number"></paper-input>
                                    <div class="pd-r"></div>
                                    <paper-autocomplete
                                                class="layout-flex"
                                                id="autocompleteTimeslot"
                                                label="{{localize('timeslot')}}"
                                                text-property="name"
                                                value-property="name"
                                                remote-source
                                                on-autocomplete-change="_searchTimeslot">
                                        <template slot="autocomplete-custom-template">
                                            ${autocompleteStyle}
                                            <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div index="[[index]]">
                                                    <div class="service-name">[[item.name]]</div>
                                                    <div class="service-description">[[item.monitorContainerReference.name]]</div>
                                                </div>
                                                <paper-ripple></paper-ripple>
                                            </paper-item>
                                        </template>
                                    </paper-autocomplete>
                                    <div class="pd-r"></div>
                                    <paper-button on-tap="addToTimeline" class="button-search">{{localize('add-to-timeline')}}</paper-button>
                                </paper-card>
                                <paper-button on-tap="submitEntityButton" class="save">{{localize(labelAction)}}</paper-button>
                            </div>
                            <div class="flex-horizontal flex">
                                <paper-autocomplete
                                        id="bind"
                                        label="{{localize('bind-timeline')}}"
                                        text-property="name"
                                        value-property="name"
                                        remote-source
                                        on-autocomplete-selected="_selectBind"
                                        on-autocomplete-change="_searchBind">
                                    <template slot="autocomplete-custom-template">
                                        ${autocompleteStyle}
                                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div index="[[index]]">
                                                <div class="service-name">[[item.name]]</div>
                                            </div>
                                            <paper-ripple></paper-ripple>
                                        </paper-item>
                                    </template>
                                </paper-autocomplete>
                                <paper-chips id="bindChips" items="{{entity.binds}}"></paper-chips>           
                            </div>
                            <div id="listItems" class="timeline flex-1">
                                <template is="dom-repeat" id="timelineItems" items="[[entity.timelineItems]]" as="timelineItem">
                                    <paper-timeline-item timeline-item="{{timelineItem}}" on-remove="removeItem" on-remove-reference="removeItem"></paper-timeline-item>
                                </template>
                            </div>
                        </form>
                    </iron-form>
            `;
        }

        static get properties () {
            return {

                /**
                 * @type TimelineEntity
                 */
                entity: {
                    observer: '_changeEntity',
                    value: {}
                },


                time: {
                    type: Object,
                    readOnly: true,
                    value: new (require("@dsign/library").date.Time)()
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
                            _storage : "TimelineStorage",
                            _timeslotStorage: "TimeslotStorage"
                        },
                        EntityContainerAggregate: {
                            _entityReference : "EntityReference"
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
                },

                /**
                 * @type StorageInterface
                 */
                _entityReference: {
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
            this.$.formEntity.addEventListener('iron-form-presubmit', this.submitEntity.bind(this));
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
         */
        submitEntityButton(evt) {
            this.$.formEntity.submit();
        }

        /**
         * @param evt
         * @private
         */
        _searchBind(evt) {
            // TODO refactor search
            this._storage.getAll({name: evt.detail.value.value})
                .then((data) => {

                    let filter = data.filter(
                        element => {
                            return element.id !== this.entity.id;
                        }
                    );

                    evt.detail.target.suggestions(
                        filter
                    );
                })
                .catch((err) => {
                        console.log(err)
                    }
                );
        }

        /**
         * @param evt
         * @private
         */
        _selectBind(evt) {
            let timelineReference = new this._entityReference.constructor();
            timelineReference.id = evt.detail.value.id;
            timelineReference.setCollection('timeline');
            timelineReference.name = evt.detail.value.name

            this.push('entity.binds', timelineReference);

            setTimeout(
                () => {
                    this.$.bind.clear();
                },
                200
            );
        }

        /**
         * @param evt
         * @private
         */
        async _searchTimeslot(evt) {

            let search = {};
            search.name = evt.detail.value.text;

            this._timeslotStorage
                .getAll(search)
                .then((data) => {
                    evt.detail.target.suggestions(data);
                })
                .catch((err) => {
                        console.error(err)
                    }
                );
        }

        /**
         * @param evt
         */
        removeItem(evt) {

            this.entity.removeItem(evt.detail.timelineItem.time, evt.detail.timeslotReference);

            this._updateTimelineTimeWc(evt.detail.timelineItem.time);
            this.$.timelineItems.render();
        }

        /**
         * @param evt
         */
        addToTimeline(evt) {


            if (!this.$.autocompleteTimeslot.value) {
                return;
            }

            let timeslotReference = new this._entityReference.constructor();
            timeslotReference.id = this.$.autocompleteTimeslot.value.id;
            timeslotReference.setCollection('timeslot');
            timeslotReference.name = this.$.autocompleteTimeslot.value.name;
            this.entity.addItem(this.time.clone(), timeslotReference);

            let list = this.entity.timelineItems;
            this.entity.timelineItems = [];
            this.$.timelineItems.render();
            this.entity.timelineItems = list;
            this.$.timelineItems.render();

            this.$.autocompleteTimeslot.clear();
            this.$.autocompleteTimeslot._selectedOption = null;
            this._updateTimelineTimeWc(this.time);
        }

        /**
         * @param {Time} time
         */
        _updateTimelineTimeWc(time) {
            let item = this.shadowRoot.querySelector(`paper-timeline-item[identifier="${time.toString()}"]`);
            if (item) {
                item.updateData();
            }
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
                }).catch((err) => {
                    console.log(err)
                }
            );
        }
    }

    window.customElements.define('timeline-view-upsert', TimelineViewUpsert);

})()