import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityPaginationBehavior} from "../../../../elements/storage/entity-pagination-behaviour";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import "../../element/paper-monitor/paper-monitor";
import {lang} from './language/list-language';

/**
 * @customElement
 * @polymer
 */
class MonitorViewList extends mixinBehaviors([EntityPaginationBehavior], DsignLocalizeElement) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-monitor {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-monitor {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-monitor {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-monitor {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-monitor {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-monitor {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="monitor">
                    <paper-monitor entity="{{monitor}}" on-delete="_deleteEntity" on-update="_showUpdateView" on-enable-monitor="_updateEntity"></paper-monitor>
                </template>
            </div>
            <paper-pagination page="{{page}}" total-item="{{totalItems}}" item-per-page="{{itemPerPage}}" next-icon="next" previous-icon="previous"></paper-pagination>
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {
            selected: {
                type: Number,
                notify: true,
                value: 0
            },

            entitySelected: {
                notify: true
            },

            services : {
                value : {
                    "StorageContainerAggregate": 'StorageContainerAggregate'
                }
            },

            storageService : {
                value: 'MonitorStorage'
            }
        };
    }

    static get observers() {
        return [
            'observerStorage(StorageContainerAggregate, storageService)',
            'observerPaginationEntities(page, itemPerPage, storage)'
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
}
window.customElements.define('monitor-view-list', MonitorViewList);
