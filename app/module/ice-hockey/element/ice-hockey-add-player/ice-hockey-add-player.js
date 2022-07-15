import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "@dsign/polymer-mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "@dsign/polymer-mixin/storage/crud-mixin";
import {lang} from './language';


/**
 * @customElement
 * @polymer
 */
class IceHockeyAddPlayer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }

                paper-card {
                    padding: 20px 0;
                }
            </style>
            <paper-card elevation="0">
                <div>{{localize('player')}}</div>
                <paper-input label="{{localize('firstname')}}"></paper-input>
                <paper-input label="{{localize('lastname')}}"></paper-input>
                <paper-input label="{{localize('role')}}"></paper-input>
                <paper-input label="{{localize('shirtNumber')}}"></paper-input>
                <div><paper-button>{{localize(stringBtn)}}</paper-button><div>
            </paper-card>
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
            player: {
                notify: true,
                value: {}
            },

            /**
             * @type MonitorEntity
             */
            typeTeam: {
                type: String,
                notify: true
            },

            stringBtn: {
                type: String,
                notify: true,
                value: 'add'
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
window.customElements.define('ice-hockey-add-player', IceHockeyAddPlayer);
