import {html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
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
import {lang} from './language/upsert-language';
import {DsignServiceInjectorElement} from "../../../../elements/service/dsign-service-injector";

/**
 * @customElement
 * @polymer
 */
class PlaylistViewUpsert extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

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

            entityHydrator: {
                type: String,
                value: 'PlaylistEntityHydrator'
            },

            services : {
                value : {
                    "EntityContainerAggregate" : "EntityContainerAggregate",
                    "HydratorContainerAggregate" : "HydratorContainerAggregate",
                    "StorageContainerAggregate": {
                        "playlistStorage":"PlaylistStorage",
                        "timeslotStorage":"TimeslotStorage",
                    }
                }
            },

            entity: {
                observer: '_changeEntity',
                value: {}
            },

            selected: {
                type: Number,
                value: 0
            },

            labelAction: {
                type: String,
                value: 'save'
            }
        };
    }

    static get observers() {
        return [
            'observerEntityToInject(entity, entityHydrator, HydratorContainerAggregate)'
        ]
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
        // TODO filter fot monitor id
        this.timeslotStorage.getAll({name : evt.detail.value.text})
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
        this.playlistStorage.getAll({name : evt.detail.value.text})
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
        this.playlistStorage[method](this.entity)
            .then((data) => {

                if (method === 'save') {
                    console.log('SALVATO');
                    // TODO pass to entity manager
                    this.entity = new PlaylistEntity();
                    this.$.formPlaylist.reset();
                }
            });

    }
}
window.customElements.define('playlist-view-upsert', PlaylistViewUpsert);
