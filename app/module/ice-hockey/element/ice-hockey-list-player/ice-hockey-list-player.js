import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import {lang} from './language';
import "../paper-ice-hockey/paper-ice-hockey";

/**
 * @customElement
 * @polymer
 */
class IceHockeyListPlayer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>
             
            </style>
            <dom-repeat id="menu" items="{{languages}}" as="language">
                <template>
                    <paper-item value="{{language}}">{{localize(language)}}</paper-item>
                </template>
            </dom-repeat>
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
            players: {
                type: Array,
                notify: true,
                value: []
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _notify : "Notify",
                    _localizeService: 'Localize',
                    "StorageContainerAggregate": {
                        _storage: "IceHockeyMatchStorage"
                    }
                }
            }
        };
    }
}
window.customElements.define('ice-hockey-list-player', IceHockeyListPlayer);
