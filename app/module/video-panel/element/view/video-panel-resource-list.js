import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "@dsign/polymer-mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "@dsign/polymer-mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";

import './../paper-video-panel-resource/paper-video-panel-resource';
import {lang} from './language/video-panel-list-language';

/**
 * @customElement
 * @polymer
 */
class VideoPanelResourceViewList extends StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-video-panel-resource {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-video-panel-resource {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-video-panel-resource {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-video-panel-resource {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-video-panel-resource {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-video-panel-resource {
                        flex-basis: 16.6%;
                    }
                }
               
                
            </style>
            <slot name="header"></slot>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="videoPanelResource">
                     <paper-video-panel-resource
                        entity="{{videoPanelResource}}" 
                        on-delete="_deleteEntity" 
                        on-update="_showUpdateView">
                    </paper-video-panel-resource>
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
             * @type boolean
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
                    _localizeService: "Localize",
                    StorageContainerAggregate: {
                        _storage: "VideoPanelResourceStorage"
                    }
                }
            },


            /**
             * @type Notify
             */
            _timelineService: {
                type: Object,
                readOnly: true
            },
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
window.customElements.define('video-panel-resource-view-list', VideoPanelResourceViewList);
