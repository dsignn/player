import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '@collaborne/paper-chip/paper-chip';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-icon/iron-icon';

class PaperInputInjectorDataService extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

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
                
                paper-chip {
                    padding-right: 6px;
                }
                
                .delete {
                    --iron-icon-height: 16px;
                    --iron-icon-width: 16px;
                    color: var(--paper-grey-300);
                    background-color: var(--disabled-text-color);
                    border-radius: 50% ;
                    margin-bottom: 3px;
                }
             
                paper-chip[selectable]:hover .delete {
				    color: black;
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
                            on-autocomplete-selected="_selectData">
                    </paper-autocomplete>
                </div>
            </div>
            <div>
                 <template is="dom-repeat" items="[[value]]" as="injectorData">
                    <paper-chip selectable>
                        [[_computeInjectorData(injectorData)]]
                        <iron-icon index="[[index]]" icon="icons:clear" on-tap="_deleteChip" class="delete"></iron-icon>
                    </paper-chip>
                 </template>
            </div>
        `;
    }

    static get properties() {
        return {

            hideDataInput: {
                type: Boolean,
                notify: true,
                value: true
            },

            textProperty : {
                type: String,
                notify: true,
                value: 'name'
            },

            value: {
                type: Array,
                notify: true,
                value: []
            },

            services : {
                value : {
                    injectorServices:"InjectorDataTimeslotAggregate"
                }
            },
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

        let suggestions = [];
        for (let property in this.injectorServices.services) {
            if (this.injectorServices.services[property].serviceLabel.search(new RegExp(evt.detail.value.text, 'i')) > -1) {
                suggestions.push(this.injectorServices.services[property]);
            }
        }

        evt.detail.target.suggestions(suggestions);
    }

    /**
     * @param evt
     * @private
     */
    _selectService(evt) {
        this.hideDataInput = false;
    }

    /**
     * @param evt
     * @private
     */
    _searchValue(evt) {

        this.$.serviceInput.value.getServiceData(evt.detail.value.text)
            .then((data) => {
                evt.detail.target.suggestions(data)
            });
    }

    /**
     * @param evt
     * @private
     */
    _selectData(evt) {
        let injector = new Injector();
        injector.setData(this.$.serviceInput.value.extractTimeslot(evt.detail.value));
        injector.setName(this.$.serviceInput.value.serviceName);
        this.push('value', injector);
        this.$.serviceInput.clear();
        setTimeout(
            () => {
                this.$.dataInput.clear();
            },
            200
        );
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
     * @param injector
     * @private
     */
    _computeInjectorData(injector) {
        let data = this.injectorServices.get(injector.name).getTimeslotData(injector.data);
        return `${this.injectorServices.get(injector.name).serviceName} - ${data.name}`;
    }

    /**
     * @param evt
     * @private
     */
    _deleteChip(evt) {
        console.log('deleeeeeeeeeeeeeeeeeee')
        this.splice('value', evt.target.index, 1);
    }

}

window.customElements.define('paper-input-injector-data-service', PaperInputInjectorDataService);
