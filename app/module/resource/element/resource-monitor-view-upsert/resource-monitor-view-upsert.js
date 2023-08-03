import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import { StorageEntityMixin } from "@dsign/polymer-mixin/storage/entity-mixin";
import '@polymer/paper-input/paper-input';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@fluidnext-polymer/paper-input-file/icons/paper-input-file-icons';
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import '@polymer/paper-tooltip/paper-tooltip';
import { flexStyle } from '../../../../style/layout-style';
import { autocompleteStyle } from '../../../../style/autocomplete-custom-style';
import { lang } from './language';

import { EntityReference } from "@dsign/library/src/storage/entity/EntityReference";
import { MultiMediaEntity } from '../../src/entity/MultiMediaEntity';
import { MetadataEntity } from '../../src/entity/MetadataEntity';


/**
 * @customElement
 * @polymer
 */
class ResourceMonitorViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
                ${flexStyle}
                <style>
                    .row {
                        @apply --layout-horizontal;
                    }

                    #name,
                    #selectResource {
                        width: 100%;
                    }

                </style>
                <slot name="header"></slot>
                <div id="container">
                   <iron-form id="formResource">
                        <form method="post">
                            <div>
                                <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                <paper-autocomplete
                                    id="selectResource"
                                    label="{{localize('search-resource')}}"
                                    value="{{entity.resourceReference}}"
                                    text-property="name"
                                    value-property="name"
                                    on-autocomplete-change="_searchResource"
                                    on-autocomplete-selected="_selectResource"
                                    on-autocomplete-reset-blur="_clearResource"
                                    require
                                    remote-source>
                                        <template slot="autocomplete-custom-template">
                                            ${autocompleteStyle}
                                            <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                                <div index="[[index]]">
                                                    <div class="service-name">[[item.name]]</div>
                                                </div>
                                            </paper-item>
                                        </template>
                                </paper-autocomplete>    
                                <paper-autocomplete 
                                    id="autocompleteMonitor"
                                    label="{{localize('monitor')}}" 
                                    text-property="name"
                                    value-property="name"
                                    on-autocomplete-change="_searchMonitor"
                                    value="{{entity.monitorContainerReference}}"
                                    require
                                    remote-source>
                                        <template slot="autocomplete-custom-template">
                                            ${autocompleteStyle}
                                            <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                                <div index="[[index]]">
                                                    <div class="service-name">[[item.name]]</div>
                                                    <div class="service-description">{{localize('duration')}}[[item.height]] x [[item.width]]</div>
                                                </div>
                                                <paper-ripple></paper-ripple>
                                            </paper-item>
                                        </template>
                                </paper-autocomplete>          
                            </div>
                            <paper-autocomplete 
                                id="autocompleteBind"
                                label="{{localize('bind-resource')}}" 
                                text-property="name"
                                value-property="name"
                                on-autocomplete-change="_searchBindResource"
                                on-autocomplete-selected="_selectBindResource"
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
                            <paper-chips id="bindChips" items="{{entity.binds}}"></paper-chips>     
                            <div>
                                <div class="flex flex-horizontal-end" style="margin-top: 20px;">
                                    <paper-button on-tap="submitResourceButton">{{localize(labelAction)}}</paper-button>
                                </div>
                            </div>
                        </form>
                    </iron-form>
                </div>
        `;
    }

    static get properties() {
        return {

            /**
             * @type FileEntity
             */
            entity: {
                observer: '_changeEntity'
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
            services: {
                value: {
                    _notify: "Notify",
                    _localizeService: 'Localize',
                    "HydratorContainerAggregate": {
                        _resourceHydrator: "ResourceMonitorStorageHydrator"
                    },
                    StorageContainerAggregate: {
                        _storage: "ResourceSenderStorage",
                        _storageResource: "ResourceStorage"
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
        }
    }

    _searchResource(evt) {
        this._storageResource.getAll({ name: evt.detail.value.text })
            .then((resources) => {
                console.log('_searchResource', resources);
                evt.detail.target.suggestions(
                    resources
                );
            });
    }

    /**
     *
     * @param evt
     * @private
     */
    _searchMonitor(evt) {
        // TODO cotroll papar autocomplete
        if (!this._monitorService || !evt.detail.value) {
            return;
        }

        let enableMonitor = this._monitorService.getEnableMonitor();
        let monitors = enableMonitor.id ? enableMonitor.getMonitors({ nested: true }) : [];

        let filter = monitors.filter(
            element => {
                return element.name.search(new RegExp(evt.detail.value.text, 'i')) > -1;
            }
        );

        let reference;
        for (let cont = 0; filter.length > cont; cont++) {
            reference = new (require("@dsign/library").storage.entity.EntityNestedReference)();
            reference.setCollection('monitor');
            reference.setId(filter[cont].id);
            reference.height = filter[cont].height;
            reference.width = filter[cont].width;
            reference.setParentId(this._monitorService.getEnableMonitor().getId());
            reference.name = filter[cont].name;
            filter[cont] = reference;
        }

        evt.detail.target.suggestions(
            filter
        );
    }

    /**
     * @param evt
     * @private
     */
    _searchBindResource(evt) {
        // TODO cotroll papar autocomplete
        if (!this._storage || !evt.detail.value) {
            return;
        }

        this._storage.getAll({ name: evt.detail.value.text })
            .then((resources) => {

                evt.detail.target.suggestions(
                    resources.filter(
                        (element) => {
                            return element.id !== this.entity.id
                        }
                    )
                );
            })
    }

    /**
     * @param evt
     * @private
     */
    _selectBindResource(evt) {

        let reference = new EntityReference();
        reference.setCollection('resource-monitor');
        reference.setId(evt.detail.value.id);
        reference.name = evt.detail.value.name;

        this.push('entity.binds', reference);

        setTimeout(
            function () {
                this.clear();
            }.bind(evt.target),
            300
        );
    }

    _selectResource(evt) {
        console.log('_selectResource');

        this.entity.resourceReference = evt.detail.value;
    }

    _clearResource(evt) {
        console.log('_clearResource');
    }

    /**
     * @param evt
     */
    submitResourceButton(evt) {
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
                    this.entity = this._storage.getHydrator().hydrate({ type: "text/html" });
                    this.$.formResource.reset();
                }

                this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
            });

    }
}
window.customElements.define('resource-monitor-view-upsert', ResourceMonitorViewUpsert);
