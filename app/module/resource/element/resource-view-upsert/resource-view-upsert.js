import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageEntityMixin} from "@dsign/polymer-mixin/storage/entity-mixin";
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
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language';

import {MultiMediaEntity} from './../../src/entity/MultiMediaEntity';
import {MetadataEntity} from './../../src/entity/MetadataEntity';


/**
 * @customElement
 * @polymer
 */
class ResourceViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
                ${flexStyle}
                <style>
                    .row {
                        @apply --layout-horizontal;
                    }

                    .body {
                        flex-basis: 75%;
                        margin-top: 17px;
                    }

                    #fileUpload,
                    #searchResource {
                        width: 100%;
                    }

                    #multiMedia,
                    #dataService {
                        width: 100%;
                        display: none;
                    }

                    .filter {
                        flex-basis: 24%;
                    }

                    paper-card.container {
                        @apply --paper-card-container;
                        margin-left: 8px;
                        margin-right: 8px;
                        margin-top: 8px;
                    }
                </style>
                <slot name="header"></slot>
                <div id="container">
                   <iron-form id="formResource">
                        <form method="post">
                            <div class="row">
                                <div class="body">
                                    <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                    <div class="row">
                                        <paper-toggle-button id="paperMultiMediaEntity" on-change="_toggleMultiMedia"></paper-toggle-button>
                                        <paper-tooltip for="paperMultiMediaEntity" position="right">{{localize('enable-multi-media')}}</paper-tooltip>  
                                        <paper-input-file id="fileUpload" label="{{localize('search-file')}}" on-change="updateEntityPrototypeEvt" accept="image/png, image/jpeg, video/*, audio/*, application/zip"></paper-input-file>
                                        <div id="multiMedia" class="row">
                                            <paper-autocomplete
                                                id="searchResource"
                                                label="{{localize('search-resource')}}"
                                                text-property="search"
                                                value-property="search"
                                                on-autocomplete-change="_searchResource"
                                                on-autocomplete-selected="_selectResource"
                                                on-autocomplete-reset-blur="_clearResource"
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
                                            <paper-chips id="resourcesChips" items="{{entity.resources}}"></paper-chips>
                                        </div>
                                    </div>
                                    <div>
                                        <paper-input id="tag" name="name" label="{{localize('tag')}}" on-keypress="addTag"></paper-input>
                                        <paper-chips id="chips" items="{{entity.tags}}"></paper-chips>
                                    </div>
                                    <div id="dataService">
                                        <paper-input-injector-data-service value="{{entity.dataReferences}}"></paper-input-injector-data-service>
                                    </div>
                                </div>
                                <div class="filter">
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

    static get properties () {
        return {

            /**
             * @type FileEntity
             */
            entity: {
                observer: '_changeEntity',
                value: {type: "text/html", tags: []}
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
                        _resourceHydrator : "ResourceEntityHydrator"
                    },
                    StorageContainerAggregate : {
                        _storage :"ResourceStorage"
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
     * @param evt
     */
    addTag(evt) {
       if (evt.charCode === 13 && evt.target.value) {
            this.$.chips.add(evt.target.value);
            this.$.tag.value = "";
       }
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

        if ((newValue instanceof MultiMediaEntity)) {
            this.$.paperMultiMediaEntity.checked = true;     
            this.showToggleMultiMedia(true);    
            this.showDataService(false); 
        } else if ((newValue instanceof MetadataEntity)) {
            this.showToggleMultiMedia(false); 
            this.showDataService(true); 
        } else {
            this.$.paperMultiMediaEntity.checked = false;
            this.showToggleMultiMedia(false); 
            this.showDataService(false); 
        }

        if (newValue.id) {
            this.labelAction = 'update';
        }
    }

    _searchResource(evt) {
        console.log('_searchResource');
    
        this._storage.getAll({name : evt.detail.value.text})
            .then((resources) => {

                evt.detail.target.suggestions(
                    resources
                );
            });
    }

    _selectResource(evt) {
        console.log('_selectResource');

        this.push('entity.resources', evt.detail.value);

        setTimeout(
            function () {
                this.clear();
            }.bind(evt.target),
            300
        );
    }

    _clearResource(evt) {
        console.log('_clearResource');
    }


    _toggleMultiMedia(evt) {
 
        let file = {};
        if (evt.target.checked) {
            file.type = 'multi/media';
        } else {
            file.type = 'text/html';
        }
        this.showToggleMultiMedia(evt.target.checked);
        this.updateEntityPrototype(file);
    }

    /**
     * @param {bool} show 
     */
    showToggleMultiMedia(show) {
        if (show) {
            this.$.multiMedia.style.display = 'block';
            this.$.fileUpload.style.display = 'none';
        } else {
            this.$.multiMedia.style.display = 'none';
            this.$.fileUpload.style.display = 'block';
        }
    }

    /**
     * @param {bool} show 
     */
    showDataService(show) {
        if (show) {
            this.$.dataService.style.display = 'block';
        } else {
            this.$.dataService.style.display = 'none';
        }

    }

    updateEntityPrototypeEvt(evt) {
        console.log('evt', evt);

        if (evt.detail.length == 1) {
            this.updateEntityPrototype(evt.detail[0]);
        } else {
            // TODO multi media
        }
    }

    updateEntityPrototype(file) {
 
        let prototype = this._resourceHydrator.hydrate(file)
        delete this.entity.type;
        let resources = this.entity.resources ? this.entity.resources : [];
        this.entity = this._resourceHydrator.hydrate(this.entity, prototype);
        if (resources.length > 0) {
            this.entity.resources = resources;
        }
        this.notifyPath('entity.name');
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
       
        this.entity.name = this.$.name.value;
        this.entity.tags = this.entity.tags;

        if (!(this.entity instanceof MultiMediaEntity)) {
            this.entity.resourceToImport = this.$.fileUpload.files[0];
        }
        
        this._storage[method](this.entity)
            .then((data) => {

                if (method === 'save') {
                    this.entity = this._storage.getHydrator().hydrate({type: "text/html"});
                    this.$.formResource.reset();
                }

                this.$.fileUpload.reset();
                this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
            });

    }
}
window.customElements.define('resource-view-upsert', ResourceViewUpsert);
