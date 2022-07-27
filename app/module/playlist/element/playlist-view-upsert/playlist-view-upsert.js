import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageEntityMixin} from "@dsign/polymer-mixin/storage/entity-mixin";
import '@polymer/paper-checkbox/paper-checkbox';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-flex-layout/iron-flex-layout';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PlaylistViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                            <paper-checkbox checked="{{entity.enableAudio}}" style="padding-top: 20px;">{{localize('enable-audio')}} <i>({{localize('working-only-video')}})</i></paper-checkbox>
                            <paper-autocomplete 
                                id="autocompleteMonitor"
                                label="{{localize('timeslots')}}" 
                                text-property="name"
                                value-property="name"
                                on-autocomplete-selected="_selectTimeslot"
                                on-autocomplete-change="_searchTimeslot"
                                remote-source>
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
                            <paper-chips id="listTimeslot" items="{{entity.timeslots}}"></paper-chips> 
                            <paper-autocomplete 
                                id="autocompleteBindTimeslot"
                                label="{{localize('bind-playlist')}}" 
                                text-property="name"
                                value-property="name"
                                on-autocomplete-selected="_selectBindPlaylist"
                                on-autocomplete-change="_searchBindPlaylist"
                                remote-source>
                                <template slot="autocomplete-custom-template">
                                    ${autocompleteStyle}
                                    <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                        <div index="[[index]]">
                                            <div class="service-name">[[item.name]]</div>
                                            <div class="service-description">[[item.type]]</div>
                                        </div>
                                        <paper-ripple></paper-ripple>
                                    </paper-item>
                                </template>
                            </paper-autocomplete>
                            <paper-chips id="listPlaylist" items="{{entity.binds}}"></paper-chips> 
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
                        _monitorHydrator : "MonitorEntityHydrator"
                    },
                    StorageContainerAggregate : {
                        _storage :"PlaylistStorage",
                        _timeslotStorage:"TimeslotStorage",
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
window.customElements.define('playlist-view-upsert', PlaylistViewUpsert);
