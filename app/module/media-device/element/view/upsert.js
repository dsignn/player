import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../../../elements/mixin/service/injector-mixin";
import {LocalizeMixin} from "../../../../elements/mixin/localize/localize-mixin";
import {StorageEntityMixin} from "../../../../elements/mixin/storage/entity-mixin";
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-ripple/paper-ripple';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language/upsert-language';

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
                <iron-form id="formTimeslot">
                    <form method="post">
                        <div id="container">
                          <paper-input id="name" name="name" label="Name" value="{{resource.name}}" required></paper-input>
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
                                        <div>
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
                                <paper-button on-tap="submitTimeslotButton">{{localize(labelAction)}}</paper-button>
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
                        _storage : "TimeslotStorage",
                        _resourceStorage: "ResourceStorage"
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
            }
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }
}
window.customElements.define('media-device-view-upsert', MediaDeviceViewUpsert);
