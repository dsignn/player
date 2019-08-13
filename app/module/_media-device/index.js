import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../elements/mixin/service/injector-mixin";
import {LocalizeMixin} from "../../elements/mixin/localize/localize-mixin";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tabs/paper-tabs';
import './element/view/list'
import './element/view/upsert'
import {flexStyle} from '../../style/layout-style';
import {lang} from './language';
/**
 * @customElement
 * @polymer
 */
class MediaDeviceIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle} 
            <style>
                div.header {
                    @apply --header-view-list;
                }
                
                paper-tabs {
                    margin-bottom: 8px;
                    max-width: 450px;
                }
            
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                }
                
                .topology {
                    position: relative;
                }
            </style>
            <iron-pages id="ironPages" selected="{{selected}}">
                <div id="list">
    media list
                </div>
                <div id="add">
    media add
                </div>
                <div id="update">
    media update                
                </div>
            </iron-pages>      
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {

            /**
             * @type number
             */
            selected: {
                type: Number,
                value: 0
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize'
                }
            }
        };
    }

    /**
     * @param evt
     */
    displayAddView(evt) {
        this.selected = 1;
    }

    /**
     * @param evt
     */
    displayListView(evt) {
        this.selected = 0;
    }
}
window.customElements.define('media-device', MediaDeviceIndex);
