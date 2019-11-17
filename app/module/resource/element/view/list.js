import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../../../elements/mixin/service/injector-mixin";
import {LocalizeMixin} from "../../../../elements/mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "../../../../elements/mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "../../../../elements/mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import "../../element/paper-resource/paper-resource";
import {lang} from './language/list-language';

/**
 * @customElement
 * @polymer
 */
class ResourceViewList extends StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-resource {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-resource {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-resource {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-resource {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-resource {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-resource {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
                <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="resource">
                    <paper-resource entity="{{resource}}" on-delete="_deleteEntity" on-update="_showUpdateView"></paper-resource>
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

            itemPerPage: {
                value: 20
            },

            /**
             * @type number
             */
            selected: {
                type: Number,
                notify: true,
                value: 0
            },

            /**
             * @type FileEntity
             */
            entitySelected: {
                notify: true
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _notify : "Notify",
                    _localizeService: 'Localize',
                    "StorageContainerAggregate": {
                        _storage: "ResourceStorage"
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
}
window.customElements.define('resource-view-list', ResourceViewList);
