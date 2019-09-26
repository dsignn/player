import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../../../../elements/mixin/service/injector-mixin";
import {LocalizeMixin} from "../../../../elements/mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "../../../../elements/mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "../../../../elements/mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import "../paper-timeline/paper-timeline";

import {lang} from './language/list-language';

/**
 * @customElement
 * @polymer
 */
class TimelineViewList extends  StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-timeline {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-timeline {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-timeline {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-timeline {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-timeline {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-timeline {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="timeline">
                    <paper-timeline 
                        entity="{{timeline}}"
                        on-play="play"
                        on-resume="resume"
                        on-stop="stop"
                        on-pause="pause"
                        on-delete="_deleteEntity"
                        on-update="_showUpdateView"             
                        on-change-rotation="_updateEntity"
                        on-change-context="_updateEntity">
                    </paper-timeline>
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
                        _storage: "TimelineStorage"
                    },
                    _timelineService: "TimelineService"
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
     * @param evt
     */
    play(evt) {
        this._timelineService.play(evt.detail);
    }

    /**
     * @param evt
     */
    resume(evt) {
        this._timelineService.resume(evt.detail);
    }

    /**
     * @param evt
     */
    stop(evt) {
        this._timelineService.stop(evt.detail);
    }

    /**
     * @param evt
     */
    pause(evt) {
        this._timelineService.pause(evt.detail);
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
window.customElements.define('timeline-view-list', TimelineViewList);
