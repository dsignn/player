import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageEntityMixin} from "@dsign/polymer-mixin/storage/entity-mixin";
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-ripple/paper-ripple';
import '../paper-video-panel-resource-item/paper-video-panel-resource-item';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language/video-panel-resource-upsert-language';
import {Path} from '@dsign/library/src/path/Path';
import {MongoIdGenerator} from '@dsign/library/src/storage/util/MongoIdGenerator';

/**
 * @customElement
 * @polymer
 */
class VideoPanelResourceViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))  {

    static get template() {
        return html`
                ${flexStyle}
                <style>
                    
                    paper-video-panel-resource-item {
                        margin-bottom: 8px;;
                    }
                
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
                        overflow: hidden;
                    }
                    
                    
              
                </style>
                <slot name="header"></slot>
                <iron-form id="formEntity">
                    <form method="post">
                        <div>
                            <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                            <paper-input id="nameResource" name="name" label="{{localize('name-resource')}}" value="{{entity.resourceReference.name}}" required></paper-input>
                            <div class="flex flex-horizontal">
                                <paper-autocomplete
                                        style="flex: 1;"
                                        id="panel"
                                        label="{{localize('video-panel')}}"
                                        value="{{entity.videoPanelResource.videoPanelReference}}"
                                        text-property="name"
                                        value-property="name"
                                        remote-source
                                        on-autocomplete-selected="_selectVideoPanel"
                                        on-autocomplete-change="_searchVideoPanel"
                                        on-autocomplete-reset-blur="_resetVideoPanel">
                                    <template slot="autocomplete-custom-template">
                                        ${autocompleteStyle}
                                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                            <div index="[[index]]">
                                                <div class="service-name">[[item.name]]  <i>([[item.parentName]])</i></div>
                                                <div class="service-description">
                                                    Width [[item.width]]px
                                                    Height [[item.height]]px
                                                </div>
                                            </div>
                                            <paper-ripple></paper-ripple>
                                        </paper-item>
                                    </template>
                                </paper-autocomplete>
                            </div>
                            <div hidden$="{{hideResourceSection}}">
                                <template is="dom-repeat" items="[[entity.videoPanelResource.videoPanelResources]]" as="videoPanelResource">
                                   <paper-video-panel-resource-item video-panel-resource="{{videoPanelResource}}"></paper-video-panel-resource-item>
                                </template>
                            <paper-progress id="resourceProgress" hidden$="{{progressResource}}" indeterminate class="slow"></paper-progress>
                            </div>
                        
                    
                        <div>
                            <div class="flex flex-horizontal-end" style="margin-top: 20px;">
                                <paper-button id="todo" on-tap="createVideoPanelResource">{{localize('create-resource')}}</paper-button>
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
             * @type VideoPanelContainerEntity
             */
            entity: {
                observer: '_changeEntity',
                value: {}
            },

            videoPanel: {
                type: Object,
                readOnly: true,
                observer: '_changeVideoPanel',
            },

            /**
             * @type string
             */
            labelAction: {
                type: String,
                value: 'save'
            },

            hideResourceSection: {
                type: Boolean,
                notify: true,
                value: true
            },

            services : {
                value : {
                    _notify: "Notify",
                    _localizeService: 'Localize',
                    _application: 'Application',
                    StorageContainerAggregate : {
                        _storage : "VideoPanelResourceStorage",
                        _videoPanelStorage : "VideoPanelStorage",
                    },
                    EntityContainerAggregate: {
                        _entityNestedReference : "EntityNestedReference",
                        _entityReference : "EntityReference",
                        _videoPanelResource : "VideoPanelResource"
                    },
                    HydratorContainerAggregate: {
                        _videoPanelToVideoPanelResourceContainerHydrator: "VideoPanelToVideoPanelResourceContainerHydrator"
                    },
                    _videoPanelService: "VideoPanelService"
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
            _videoPanelStorage: {
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
            _videoPanelResource: {
                type: Object,
                readOnly: true
            },

            /**
             * @type VideoPanelService
             */
            _videoPanelService: {
                type: Object,
                readOnly: true
            },

            /**
             * @type Application
             */
            _application: {
                type: Object,
                readOnly: true
            },

            /**
             * @type AbstractHydrator
             */
            _videoPanelToVideoPanelResourceContainerHydrator: {
                type: Object,
                readOnly: true,
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
            this.hideResourceSection = true;
            return;
        }

        if (newValue.id) {
            this.hideResourceSection = false;
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
     * @param newValue
     * @private
     */
    _changeVideoPanel(newValue) {
        if (!newValue) {
            return;
        }

        if ( newValue.hasVideoPanel()) {
            let videoPanel = newValue.getVideoPanel().getVideoPanel(this.entity.videoPanelResource.videoPanelReference.id);
            let tmpVideoPanel = videoPanel.getVideoPanels({nested:true});
            for (let cont = 0; tmpVideoPanel.length > cont; cont++) {
                tmpVideoPanel[cont].parentId = newValue.id;
                tmpVideoPanel[cont].parentName = newValue.name;
            }

            let videoPanelResource = this._videoPanelToVideoPanelResourceContainerHydrator.hydrate(videoPanel);
            this.set('entity.videoPanelResource.videoPanelResources',  videoPanelResource.videoPanelResources);
        }
    }

    /**
     * @param {Event} evt
     */
    createVideoPanelResource(evt) {

        let path = new Path();
        path.setExtension('mp4');
        // TODO change name dyslexia
        path.setNameFile(MongoIdGenerator.statcGenerateId());
        // TODO refactor sep
        path.setDirectory(`${this._application.getStoragePath()}tmp` );

        this._videoPanelService.generateResource(
            this.entity.videoPanelResource,
            path
        );
    }

    /**
     * @param evt
     * @private
     */
    _searchVideoPanel(evt) {
        this._videoPanelStorage.getAll({name: evt.detail.value.text})
            .then((data) => {

                let videoPanels =  [];
                let tmpVideoPanel =  [];
                let tmpObject = null;

                for (let cont = 0; data.length > cont; cont++) {

                    // TODO check data flow

                    tmpVideoPanel = videoPanels.concat(data[cont].hasVideoPanel() ? data[cont].videoPanel.getVideoPanels({nested:true}) : []);
                    for (let nestedCont = 0; tmpVideoPanel.length > nestedCont; nestedCont++) {

                        tmpObject = new (this._entityNestedReference.constructor)();
                        tmpObject.setId(tmpVideoPanel[nestedCont].id);
                        tmpObject.setParentId(data[cont].id);
                        tmpObject.setCollection('video-panel');
                        tmpObject.name = tmpVideoPanel[nestedCont].name;
                        tmpObject.parentName = data[cont].name;
                        tmpObject.height = tmpVideoPanel[nestedCont].height;
                        tmpObject.width = tmpVideoPanel[nestedCont].width;
                        videoPanels.push(tmpObject);
                    }
                }
                evt.detail.target.suggestions(videoPanels);
            }
        );
    }

    /**
     * @param evt
     * @private
     */
    _selectVideoPanel(evt) {
        this.hideResourceSection = false;
        let videoPanelResource = new this._videoPanelResource.constructor();
        videoPanelResource.videoPanelReference = evt.detail.value;
        this.entity.videoPanelResource = videoPanelResource;

        this._videoPanelStorage.get(videoPanelResource.videoPanelReference.parentId)
            .then((data) => {
                this._setVideoPanel(data);
            });
    }

    /**
     * @param evt
     */
    _resetVideoPanel(evt) {
        this.hideResourceSection = true;
        this.entity.setVideoPanel({});
    }
}
window.customElements.define('video-panel-resource-view-upsert', VideoPanelResourceViewUpsert);
