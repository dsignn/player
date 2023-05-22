import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from '@dsign/polymer-mixin/localize/localize-mixin';
import '@fluidnext-polymer/paper-chip/paper-chip';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-icon/iron-icon';
import {lang} from './language';

class PaperInputInjectorDataService extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>
                #container {
                  
                    @apply --layout-horizontal;
                }
                
                paper-autocomplete#serviceInput,
                div#dataContainer {
                    flex-basis: 50%;
                }
                
                .divider {
                    height: auto;
                    width: 8px;
                }

                paper-button {
                    height: 100%;
                }
                
                paper-chip {
                    padding-right: 6px;
                }
                
                .delete {
                    --iron-icon-height: 16px;
                    --iron-icon-width: 16px;
                    color: var(--paper-grey-300);
                    background-color: var(--disabled-text-color);
                    border-radius: 50%;
                    margin-bottom: 3px;
                }
             
                paper-chip[selectable]:hover .delete {
				    color: black;
			    }
                
                paper-autocomplete {
                    --autocomplete-wrapper: {
                        position: absolute;
                        min-width:250px;
                    }
                }
                    
            </style>
            <div id="container">
                <paper-autocomplete
                    id="serviceInput"
                    label="Servizio"
                    text-property="serviceLabel"
                    value-property="propertyName"
                    remote-source
                    on-autocomplete-change="_serviceSearch"
                    on-autocomplete-selected="_selectService"
                    on-autocomplete-reset-blur="_resetService">
                    <template slot="autocomplete-custom-template">
                        <style>
                            :host {
                                display: block;
                            }
    
                            paper-item.account-item {
                                padding: 8px 16px;
                            }
    
                            .service-name {
                                color: #333;
                            }
    
                            .service-description {
                                margin-top: 4px;
                                color: #999;
                            }
    
                        </style>
                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                            <div index="[[index]]">
                                <div class="service-name">[[item.serviceLabel]]</div>
                                <div class="service-description">[[item.serviceDescription]]</div>
                            </div>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </template>
                </paper-autocomplete>
                <div class="divider"></div>
                <div hidden$="{{hideDataInput}}" id="dataContainer">
                    <paper-autocomplete
                            id="dataInput"
                            label="Dati"
                            text-property="{{textProperty}}"
                            value-property="name"
                            remote-source
                            on-autocomplete-change="_searchValue"
                            on-autocomplete-selected="_addInjector">
                    </paper-autocomplete>
                </div>
                <div hidden$="{{hideNoDataInput}}"> 
                    <paper-button on-tap="_addInjector">{{localize('add')}}</paper-button>
                </div>
            </div>
            <div>
                 <template is="dom-repeat" items="[[paperItemsData]]" as="item">
                    <paper-chip selectable>
                         [[item.serviceLabel]] - [[item.name]]
                        <iron-icon index="[[index]]" icon="icons:clear" on-tap="_deleteChip" class="delete"></iron-icon>
                    </paper-chip>
                 </template>
            </div>
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties() {
        return {

            /**
             * @type boolean
             */
            hideDataInput: {
                type: Boolean,
                notify: true,
                value: true
            },

            hideNoDataInput: {
                type: Boolean,
                notify: true,
                value: true
            },

            /**
             * @type string
             */
            textProperty : {
                type: String,
                notify: true,
                value: 'name'
            },

            /**
             * @type Array
             */
            paperItemsData: {
                type: Array,
                notify: true,
                value: []
            },

            /**
             * @type Array
             */
            value: {
                type: Array,
                notify: true,
                value: [],
                observer: '_changeValue',
            },

            services : {
                value : {
                    _localizeService: 'Localize',
                    _injectorServices:"InjectorDataTimeslotAggregate"
                }
            },

            /**
             * @type MonitorService
             */
            _injectorServices: {
                type: Object,
                readOnly: true
            },

            paperLabels: {
                type: Array,
                value: []
            }
        }
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeValue(newValue, oldValue) {

        if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
            this.paperItemsData = [];
            return;
        }

        for (let cont = 0; newValue.length > cont; cont++) {
            
            this._injectorServices.get(newValue[cont].name)
                .getTimeslotData(newValue[cont].data)
                .then(function(data) {

                    let obj = {
                        serviceLabel: this.element._injectorServices.get(this.service.name).serviceLabel,
                        serviceName:  this.element._injectorServices.get(this.service.name).serviceName
                    };
                    console.log('TODO check the correct funzionality', newValue[cont].name);
                    if (this.element._injectorServices.get(this.service.name).hasData) {
                        obj.name = data[this.element._injectorServices.get(this.service.name).serviceNamespace].name;
                    }

                    this.element.push('paperItemsData', obj);
                }.bind({element: this, service: newValue[cont]}));
        }
    }

    /**
     *
     */
    clear() {
        this.$.serviceInput.clear();
    }

    /**
     * @param evt
     * @private
     */
    _serviceSearch(evt) {
        // TODO cotroll papar autocomplete
        if (!evt.detail.value) {
            return;
        }

        let suggestions = [];
        for (let property in this._injectorServices.services) {
            if (this._injectorServices.services[property].serviceLabel.search(new RegExp(evt.detail.value.text, 'i')) > -1) {
                suggestions.push(this._injectorServices.services[property]);
            }
        }

        evt.detail.target.suggestions(suggestions);
    }

    /**
     * @param evt
     * @private
     */
    _selectService(evt) {
        if (evt.detail.value.hasData) {
            this.hideDataInput = false;
            this.hideNoDataInput = true;
            this.$.serviceInput.style.flexBasis = "50%";
        } else {
            this.hideDataInput = true;
            this.hideNoDataInput = false;
            this.$.serviceInput.style.flexBasis = "100%";
        }
    }

    /**
     * @param evt
     * @private
     */
    _searchValue(evt) {
        // TODO cotroll papar autocomplete
        if (!evt.detail.value) {
            return;
        }

        this.$.serviceInput.value.getServiceData(evt.detail.value.text)
            .then((data) => {
                evt.detail.target.suggestions(data)
            });
    }

    /**
     * @param evt
     * @private
     */
     _addInjector(evt) {
        let injector = new Injector();
        injector.setName(this.$.serviceInput.value.serviceName);
        if (this.$.serviceInput.value.hasData) {
            injector.setData(this.$.serviceInput.value.extractTimeslot(evt.detail.value));
        }
       

        this.push('value', injector);
        this.$.serviceInput.clear();
        setTimeout(
            () => {
                this.$.dataInput.clear();
            },
            200
        );

        this._injectorServices.get(injector.name)
            .getTimeslotData(injector.data)
            .then(function(data) {

                let obj = {
                    serviceLabel: this._injectorServices.get(injector.name).serviceLabel,
                    serviceName: this._injectorServices.get(injector.name).serviceName
                };

                if (this._injectorServices.get(injector.name).hasData) {
                    obj.name = data[this._injectorServices.get(injector.name).serviceNamespace].name;
                }

                this.push('paperItemsData', obj);
            }.bind(this));
    }

    /**
     * @param evt
     * @private
     */
    _resetService(evt) {
        this.hideDataInput = true;
        this.$.dataInput.clear();
    }

    /**
     * @param evt
     * @private
     */
    _deleteChip(evt) {
        console.log('dai toni');
        let removeElement = this.splice('paperItemsData', evt.target.index, 1)[0];
        let findIndexValue = this.value.findIndex((element) => {
            return element.name === removeElement.serviceName;
        });
        this.splice('value', findIndexValue, 1);
    }

}

window.customElements.define('paper-input-injector-data-service', PaperInputInjectorDataService);
