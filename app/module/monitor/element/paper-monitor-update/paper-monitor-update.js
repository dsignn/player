import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-card/paper-card';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@fluidnext-polymer/paper-input-color/paper-input-color'
import '@fluidnext-polymer/paper-input-color/icons/paper-input-color-icons'
import '../../../../elements/paper-input-points/paper-input-points';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperMonitorUpdate extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle}
            <style >
                :host {
                    display: block;
                }
                
                paper-card {
                    padding: 4px;
                    display: flex;
                }
                
                paper-input,
                paper-autocomplete,
                paper-input-color {
                    padding-left: 6px;
                }
                                
                paper-input[name="name"] {
                    @apply --layout-flex;
                    min-width: 120px;
                }
                
                paper-input[name="height"],
                paper-input[name="width"] {
                     max-width: 70px;
                }
             
                paper-input[name="back"],   
                paper-input[name="offsetX"],
                paper-input[name="offsetY"] {
                    max-width: 80px;
                }
                
                paper-input-color[name="backgroundColor"],
                paper-autocomplete{
                     max-width: 120px;
                }
                
                paper-menu-button {
                    padding: 0;
                }
                
                div.action {
                    @apply --layout-vertical;
                    @apply --layout-center;
                    @apply --layout-center-justified;
                }
                
                .h-100 {
                    height: 100%;
                }
                
                paper-monitor-update {
                    margin-left: 16px;
                    margin-bottom: 4px;
                    margin-top: 4px;
                }

            </style>
            <paper-card class="layout horizontal">
                <div hidden$="{{hiddenAlwaysOnTop}}">
                    <div class="h-100 action">
                        <paper-toggle-button id="alwaysOnTop" checked="{{entity.alwaysOnTop}}" on-change="_toogleAlwaysOnTop"></paper-toggle-button>
                        <paper-tooltip for="alwaysOnTop" position="right">{{localize('always-on-top')}}</paper-tooltip>
                    </div>
                </div>
                <div class="layout vertical flex-1">
                    <div class="layout horizontal">
                        <paper-input name="name" label="{{localize('name')}}" value="{{entity.name}}"></paper-input>
                        <paper-autocomplete
                            id="defaultTimeslot"
                            label="{{localize('default-timeslot')}}"
                            text-property="name"
                            value-property="name"
                            remote-source
                            on-autocomplete-change="_defaultChanged"
                            on-autocomplete-selected="_selectDefault"
                            on-autocomplete-reset-blur="_removeDefault">
                                <template slot="autocomplete-custom-template">
                                    ${autocompleteStyle}
                                    <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                         <div index="[[index]]">
                                            <div class="service-name">[[item.name]]</div>
                                        </div>
                                    </paper-item>
                                </template>
                        </paper-autocomplete>
                        <paper-input name="height" label="{{localize('height')}}" type="number" value="{{entity.height}}" required></paper-input>
                        <paper-input name="width" label="{{localize('width')}}" type="number" value="{{entity.width}}"  required></paper-input>
                        <paper-input name="offsetX" label="{{localize('offsetX')}}" type="number" value="{{entity.offsetX}}" required></paper-input>
                        <paper-input name="offsetY" label="{{localize('offsetY')}}" type="number" value="{{entity.offsetY}}" required></paper-input>
                        <paper-input-color name="backgroundColor" label="{{localize('bg-color')}}" value="{{entity.backgroundColor}}"></paper-input-color>
                    </div>
                   <div>
                        <paper-input-points position="horizontal" value="{{entity.polygonPoints}}" </paper-input-points>
                    </div>    
                </div>
                <div class="action">
                     <paper-menu-button ignore-select horizontal-align="right">
                        <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                        <paper-listbox slot="dropdown-content" class="auto" multi>
                            <paper-item on-tap="_remove">{{localize('delete')}}</paper-item>
                        </paper-listbox>
                    </paper-menu-button>
                </div>
            </paper-card>
             <dom-repeat items="{{entity.monitors}}" as="monitor">
                <template>
                    <paper-monitor-update entity="{{monitor}}"></paper-monitor-update>   
                </template>
             </dom-repeat>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }


    static get properties () {
        return {

            /**
             * @object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _timeslotStorage: "TimeslotStorage"
                    },
                    EntityContainerAggregate: {
                        _entityReference : "EntityReference"
                    }
                }
            },

            /**
             * @type string
             */
            identifier : {
                type: String,
                reflectToAttribute : true

            },

            /**
             * @type object
             */
            entity: {
                observer: 'changeMonitor'
            },

            _timeslotStorage: {
                readOnly: true
            },

            _entityReference: {
                readOnly: true
            },

            /**
             * @type boolean
             */
            hiddenAlwaysOnTop: {
                type: Boolean,
                notify: true,
                value: true
            }
        };
    }

    /**
     * @param evt
     * @private
     */
    _defaultChanged(evt) {
        if (!this._timeslotStorage) {
            return;
        }

        this._timeslotStorage
            .getAll({name: evt.detail.value.text})
            .then(
                (data) => {
                    evt.detail.target.suggestions(data);
                }
            );
    }

    /**
     * @param evt
     * @private
     */
    _selectDefault(evt) {

        let entityReference = new this._entityReference.constructor();

        entityReference.setId(evt.detail.value.id);
        entityReference.setCollection('timeslot');
        entityReference.name = evt.detail.value.name;
        this.entity.defaultTimeslotReference = entityReference;
    }

    /**
     * @param evt
     * @private
     */
    _removeDefault(evt) {

        this.set('entity.defaultTimeslotReference', {});
    }

    /**
     * @param newValue
     */
    changeMonitor(newValue) {
        if (!newValue) {
            return;
        }

        this.identifier = newValue.id;
        this.$.defaultTimeslot.value = newValue.defaultTimeslotReference
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _remove(evt) {
        this.dispatchEvent(new CustomEvent('remove-monitor', {detail: this.entity, bubbles: true, composed: true}));
    }

    /**
     * @param evt
     * @private
     */
    _toogleAlwaysOnTop(evt) {
        this.dispatchEvent(new CustomEvent('toogle-always-on-top-monitor', {detail: this.entity}));
    }
}
window.customElements.define('paper-monitor-update', PaperMonitorUpdate);