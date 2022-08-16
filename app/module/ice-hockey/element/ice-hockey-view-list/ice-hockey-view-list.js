import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "@dsign/polymer-mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "@dsign/polymer-mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import {lang} from './language';
import "../paper-ice-hockey/paper-ice-hockey";

/**
 * @customElement
 * @polymer
 */
class IceHockeyViewList extends StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }

                #empty {
                    display: block;
                }
                
                @media (max-width: 500px) {
                    paper-ice-hockey {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-ice-hockey {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-ice-hockey {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-ice-hockey {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-ice-hockey {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-ice-hockey {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <div id="empty">{{localize('empty-monitor')}}</div>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="match">
                    <paper-ice-hockey entity="{{match}}" on-delete="_deleteEntity" on-update="_showUpdateView"></ paper-ice-hockey>
                </template>
            </div>
            <paper-pagination page="{{page}}" total-items="{{totalItems}}" item-per-page="{{itemPerPage}}" next-icon="next" previous-icon="previous"></paper-pagination>
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
                notify: true,
                value: 0
            },

            /**
             * @type MonitorEntity
             */
            entitySelected: {
                notify: true
            },

            /**
             * @type Array
             */
            entities: {
                notify: true,
                observer: "_changedEntities"
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

    static get observers() {
        return [
            'observerPaginationEntities(page, itemPerPage, _storage)'
        ]
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _showUpdateView(evt) {
        this.entitySelected = evt.detail;
        this.selected = 2;
    }

    /**
     * @private
     */
    _deleteCallback() {
        this._notify.notify(this.localize('notify-delete'));
    }

    /**
     * @private
     */
    _updateList() {
        if (Array.isArray(this.entities) && this.entities.length == 0) {
            this.$.empty.style.display = 'block';
        } else {
            this.$.empty.style.display = 'none';
        }
    }

    /**
     * @param {Array} entities 
     */
    _changedEntities(entities) {
        this._updateList();
    }
}
window.customElements.define('ice-hockey-view-list', IceHockeyViewList);
