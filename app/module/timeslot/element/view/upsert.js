import {html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '../../../../elements/paper-chip/paper-chips';
import '@p3e/paper-autocomplete/paper-autocomplete';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-ripple/paper-ripple';
import {flexStyle} from '../../../../style/layout-style';
import {lang} from './language/upsert-language';

/**
 * @customElement
 * @polymer
 */
class TimeslotViewUpsert extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

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
                    
                    @media (max-width: 900px) {
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
                    }
                        
                    @media (min-width: 901px) {
                        #container {
                             @apply  --layout-horizontal;
                        }
                    
                        #content-left {
                           @apply --layout-flex-8;
                        }
                        
                        #content-right {
                           @apply --layout-flex-4;
                           margin-left: 4px;
                        }
                    }
                </style>
                <slot name="header"></slot>
                <iron-form id="formResource">
                    <form method="post">
                        <div id="container">
                            <div id="content-left">
                                <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                <paper-input id="duration" name="duration" label="{{localize('duration')}}" type="number" min="1" value="{{entity.duration}}" required></paper-input>
                                <paper-checkbox checked="{{entity.enableAudio}}" style="padding-top: 20px;">{{localize('enable-audio')}} <i>({{localize('info-working')}})</i></paper-checkbox>
                                <paper-autocomplete 
                                    id="autocompleteMonitor"
                                    label="{{localize('monitor')}}" 
                                    text-property="name"
                                    value-property="name"
                                    on-autocomplete-selected="_selectMonitor"
                                    on-autocomplete-change="_searchMonitor"
                                    remote-source>
                                     <template slot="autocomplete-custom-template">
                                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div>
                                                <div class="service-name">[[item.name]]</div>
                                                <div class="service-description">TODO</div>
                                            </div>
                                            <paper-ripple></paper-ripple>
                                        </paper-item>
                                    </template>
                                </paper-autocomplete>
                                <paper-autocomplete 
                                    id="autocompleteResource"
                                    label="{{localize('resource')}}" 
                                    text-property="name"
                                    value-property="name"
                                    on-autocomplete-selected="_selectResource"
                                    on-autocomplete-change="_searchResource"
                                    remote-source>
                                    <template slot="autocomplete-custom-template">
                                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div>
                                                <div class="service-name">[[item.name]]</div>
                                                <div class="service-description">[[item.type]]</div>
                                            </div>
                                            <paper-ripple></paper-ripple>
                                        </paper-item>
                                    </template>
                               </paper-autocomplete>
                                <paper-autocomplete 
                                    id="autocompleteBindTimeslot"
                                    label="{{localize('timeslot')}}" 
                                    text-property="name"
                                    value-property="name"
                                    on-autocomplete-selected="_selectBindTimeslot"
                                    on-autocomplete-change="_searchBindTimeslot"
                                    remote-source>
                                    <template slot="autocomplete-custom-template">
                                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div>
                                                <div class="service-name">[[item.name]]</div>
                                                <div class="service-description">[[item.type]]</div>
                                            </div>
                                            <paper-ripple></paper-ripple>
                                        </paper-item>
                                    </template>
                                </paper-autocomplete>
                                <div>
                                    <paper-input id="tag" name="name" label="{{localize('tag')}}" on-keypress="addTag"></paper-input>
                                    <paper-chips id="chips" items="{{entity.tags}}"></paper-chips>
                                </div>                            

                            </div>
                            <div id="content-right">
                                <paper-card class="container">
                                    <paper-input id="blur-filter" name='filters["blur"]' label="Blur filter" value="{{entity.filters.blur}}"></paper-input>
                                    <paper-input id="brightness-filter" name='filters["brightness"]' label="Brightness filter" value="{{entity.filters.brightness}}"></paper-input>
                                    <paper-input id="contrast-filter" name='filters["contrast"]' label="Contrast filter" value="{{entity.filters.contrast}}"></paper-input>
                                    <paper-input id="grayscale-filter" name='filters["grayscale"]' label="Grayscale filter" value="{{entity.filters.grayscale}}"></paper-input>
                                    <paper-input id="hue-rotate-filter" name='filters["hueRotate"]' label="Grayscale filter" value="{{entity.filters.hueRotate}}"></paper-input>
                                    <paper-input id="invert-filter" name='filters["invert"]' label="Invert filter" value="{{entity.filters.invert}}"></paper-input>
                                    <paper-input id="opacity-filter" name='filters["opacity"]' label="Opacity filter" value="{{entity.filters.opacity}}"></paper-input>
                                    <paper-input id="saturate-filter" name='filters["saturate"]' label="Saturate filter" value="{{entity.filters.saturate}}"></paper-input>
                                    <paper-input id="sepia-filter" name='filters["sepia"]' label="Sepia filter" value="{{entity.filters.sepia}}"></paper-input>
                                    <paper-input id="drop-shadow-filter" name='filters["dropShadow"]' label="Drop Shadow filter" value="{{entity.filters.dropShadow}}"></paper-input>
                                </paper-card>
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
                value: 'TimeslotEntityHydrator'
            },

            entity: {
                observer: '_changeEntity',
                value: {}
            },

            labelAction: {
                type: String,
                value: 'save'
            },

            services : {
                value : {
                    "hydratorContainerAggregate" : "HydratorContainerAggregate",
                    "StorageContainerAggregate": {
                        "timeslotStorage":"TimeslotStorage",
                        "monitorStorage":"MonitorStorage",
                        "resourceStorage":"ResourceStorage"
                    },
                }
            },

        };
    }

    static get observers() {
        return [
            'observerEntityToInject(entity, entityHydrator, hydratorContainerAggregate)'
        ]
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();
    }

    /**
     * @param evt
     * @private
     */
    _selectMonitor(evt) {
        console.log('SELECT MONITOR', evt);
    }

    /**
     * @param evt
     */
    addTag(evt) {
        if (evt.charCode === 13 && evt.target.value) {
            this.$.chips.add(evt.target.value);
            this.$.tag.value = "";
        }
    }

    /**
     *
     * @param evt
     * @private
     */
    _searchMonitor(evt) {
        // TODO da
        if (!this.monitorStorage) {
            return;
        }

        this.monitorStorage.getAll({enable : 1})
            .then((monitor) => {

                let monitors = monitor.length > 0 ? monitor[0].getMonitors({nested: true}) : [];

                let filter = monitors.filter(
                    element => {
                        return element.name.search(new RegExp(evt.detail.value.text, 'i')) > -1;
                    }
                );

                evt.detail.target.suggestions(
                    filter
                );
            })
    }

    /**
     * @param evt
     * @private
     */
    _searchResource(evt) {
        // TODO da
        if (!this.resourceStorage) {
            return;
        }

        this.resourceStorage.getAll({name : evt.detail.value.text})
            .then((resources) => {

                evt.detail.target.suggestions(
                    resources
                );
            })
    }

    /**
     * @param evt
     * @private
     */
    _selectBindTimeslot(evt) {

        console.log('SELECT Bind', evt);
    }

    /**
     * @param evt
     * @private
     */
    _searchBindTimeslot(evt) {

        // TODO da
        if (!this.resourceStorage) {
            return;
        }

        this.timeslotStorage.getAll({name : evt.detail.value.text})
            .then((resources) => {

                evt.detail.target.suggestions(
                    resources
                );
            })
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
}
window.customElements.define('timeslot-view-upsert', TimeslotViewUpsert);
