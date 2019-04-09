import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import {lang} from './language/language';


/**
 * @customElement
 * @polymer
 */
class PaperMonitorUpdate extends  mixinBehaviors([EntityBehavior], DsignLocalizeElement)  {

    static get template() {
        return html`
            <style >
                :host {
                    display: block;
                }
                
                paper-card {
                    padding: 4px;
                    display: flex;
                }
                
                paper-input {
                    padding-left: 6px;
                }
                
                paper-input[name="name"],
                paper-input[name="polygon"] {
                    @apply --layout-flex;
                }
                
                paper-input[name="height"],
                paper-input[name="width"] {
                    width: 80px;
                }
                
                paper-input[name="offsetX"],
                paper-input[name="offsetY"],
                paper-input[name="backgroundColor"] {
                    width: 90px;
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
            <paper-card>
                <div hidden$="{{hiddenAlwaysOnTop}}">
                    <div class="h-100 action">
                        <paper-toggle-button id="alwaysOnTop" checked="{{entity.alwaysOnTop}}" on-change="_toogleAlwaysOnTop"></paper-toggle-button>
                        <paper-tooltip for="alwaysOnTop" position="right">{{localize('always-on-top')}}</paper-tooltip>
                    </div>
                </div>
                <paper-input name="name" label="{{localize('name')}}" value="{{entity.name}}"></paper-input>
                <paper-input name="height" label="{{localize('height')}}" type="number" value="{{entity.height}}" required></paper-input>
                <paper-input name="width" label="{{localize('width')}}" type="number" value="{{entity.width}}"  required></paper-input>
                <paper-input name="offsetX" label="{{localize('offsetX')}}" type="number" value="{{entity.offsetX}}" required></paper-input>
                <paper-input name="offsetY" label="{{localize('offsetY')}}" type="number" value="{{entity.offsetY}}" required></paper-input>
                <paper-input name="polygon" label="{{localize('custom-polygon')}}" value="{{entity.polygon}}"></paper-input>
                <paper-input name="backgroundColor" label="{{localize('bg-color')}}" type="color" value="{{entity.backgroundColor}}" required></paper-input>
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

            identifier : {
                type: String,
                reflectToAttribute : true

            },

            entity: {
                observer: 'changeMonitor'
            },

            hiddenAlwaysOnTop: {
                type: Boolean,
                notify: true,
                value: true
            }
        };
    }

    /**
     * @param newValue
     */
    changeMonitor(newValue) {
        if (!newValue) {
            return;
        }

        this.identifier = newValue.id;
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