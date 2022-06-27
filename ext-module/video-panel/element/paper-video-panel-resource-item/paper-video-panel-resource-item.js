import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperVideoPanelResourceItem extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle}
            <style >
               :host {
                    display: block;
                   --paper-chip : {
                      margin-bottom: 2px;
                      margin-top: 2px;
                   }
                }
                
                paper-card {
                    padding: 4px;
                    display: flex;
                }
                
                paper-input {
                    padding-left: 6px;
                }
                                
                paper-menu-button {
                    padding: 0;
                }
                
             
                
            </style>
            <paper-card class="layout horizontal">
                <div class="layout horizontal center flex-3">{{videoPanelResource.videoPanelReference.name}}</div>
                <paper-autocomplete
                    label="{{localize('resource')}}"
                    text-property="name"
                    value-property="name"
                    remote-source
                    on-autocomplete-change="_searchResource"
                    on-autocomplete-selected="_selectResource"
                    class="flex-3">
                    <template slot="autocomplete-custom-template">
                        ${autocompleteStyle}
                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                            <div index="[[index]]">
                                <div class="service-name">[[item.name]]  <i>([[item.type]])</i></div>
                                 <template is="dom-if" if="{{item.dimension}}">
                                      <div class="service-description">  
                                          Width [[item.dimension.width]]px
                                          Height [[item.dimension.height]]px
                                       </div>
                                 </template>
                            </div>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </template>
                </paper-autocomplete>
                <paper-chips id="resource" items="{{videoPanelResource.resources}}" class="flex-6"></paper-chips> 
            </paper-card>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {

            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate : {
                        _resourceStorage : "ResourceStorage",
                    },
                    EntityContainerAggregate: {
                        _entityReference : "EntityReference"
                    },
                }
            },

            /**
             * @type StorageInterface
             */
            _resourceStorage: {
                type: Object,
                readOnly: true
            },

            /**
             * @type VideoPanelResource
             */
            videoPanelResource: {
                type: Object
            }

        }
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _searchResource(evt) {

        this._resourceStorage.getAll({name : evt.detail.value.text})
            .then((resources) => {
                evt.detail.target.suggestions(resources);
            })
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _selectResource(evt) {
        let resourceReference = new this._entityReference.constructor();

        resourceReference.setId(evt.detail.value.id);
        resourceReference.setCollection('resource');
        resourceReference.name = evt.detail.value.name;

        this.push('videoPanelResource.resources', resourceReference);

        setTimeout(
            function () {
                this.clear();
            }.bind(evt.target),
            300
        );
    }
}
window.customElements.define('paper-video-panel-resource-item', PaperVideoPanelResourceItem);
