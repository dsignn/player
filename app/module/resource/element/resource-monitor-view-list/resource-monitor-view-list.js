import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "@dsign/polymer-mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "@dsign/polymer-mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import "./../paper-resource-monitor/paper-resource-monitor";
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class ResourceMonitorViewList extends StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

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
                    padding: 16px 0;
                    font-size: 20px;
                }
                
                @media (max-width: 500px) {
                    paper-resource-monitor {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-resource-monitor {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-resource-monitor {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-resource-monitor {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-resource-monitor {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-resource-monitor {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <div id="empty">{{localize('empty-resource')}}</div>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="resourceSender">
                    <paper-resource-monitor 
                        entity="{{resourceSender}}" 
                        on-delete="_deleteEntity" 
                        on-update="_showUpdateView"
                        on-change-rotation="_updateEntity"
                        on-change-context="_updateEntity"
                        on-change-adjust="_updateEntity"
                        on-change-volume="_updateEntity"
                        on-play="play"
                        on-resume="resume"
                        on-stop="stop"
                        on-pause="pause"
                        on-timeupdate="updateTime">
                    </paper-resource-monitor>
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
             * @type FileEntity
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
                        _storage :"ResourceSenderStorage"
                    },
                    _resourceSenderService: 'ResourceSenderService'
                }
            },

            _resourceSenderService: {
                readOnly: true,
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
        this._updateList();
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


    /**
     * @param evt
     */
     play(evt) {
        console.log('play', evt.detail.name);
        this._resourceSenderService.play(evt.detail);
    }

    /**
     * @param evt
     */
    resume(evt) {
        console.log('resume', evt.detail.name);
        this._resourceSenderService.resume(evt.detail);
    }

    /**
     * @param evt
     */
    stop(evt) {
        console.log('stop', evt.detail.name);
        this._resourceSenderService.stop(evt.detail);
    }

    /**
     * @param evt
     */
    pause(evt) {
        console.log('pause', evt.detail.name);
        this._resourceSenderService.pause(evt.detail);
    }

        /**
     * @param {CustomEvent} evt
     * @private
     */
    updateTime(evt) {
        console.log('TIME', evt.detail.resource, evt.detail.time);
        this._resourceSenderService.changeTime(evt.detail.resource, evt.detail.time);
    }
}
window.customElements.define('resource-view-monitor-list', ResourceMonitorViewList);
