import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "@dsign/polymer-mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "@dsign/polymer-mixin/storage/crud-mixin";
import "../paper-timeslot/paper-timeslot";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class TimeslotViewList extends StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-timeslot {
                        flex-basis: 100%;
                         width: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-timeslot {
                        flex-basis: 50%;
                        width: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-timeslot {
                        flex-basis: 33.3%;
                         width: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-timeslot {
                        flex-basis: 25%;
                         width: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-timeslot {
                        flex-basis: 20%;
                         width: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-timeslot {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
                <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="timeslot">
                    <paper-timeslot entity="{{timeslot}}" 
                        on-play="play"
                        on-resume="resume"
                        on-stop="stop"
                        on-pause="pause"
                        on-delete="_deleteEntity" 
                        on-update="_showUpdateView"
                        on-change-rotation="_updateEntity"
                        on-change-context="_updateEntity"
                        on-timeupdate="_updateTime">
                    </paper-timeslot>
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
                type: Boolean,
                notify: true
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _notify : "Notify",
                    _localizeService: "Localize",
                    _timeslotService : "TimeslotService",
                    StorageContainerAggregate: {
                        _storage: "TimeslotStorage"
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
     * @private
     */
    _deleteCallback() {
        this._notify.notify(this.localize('notify-delete'));
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
     * @param {CustomEvent} evt
     * @private
     */
    _updateTime(evt) {
        this._timeslotService.changeTime(evt.detail.timeslot, evt.detail.time);
    }

    /**
     * @param evt
     */
    play(evt) {
        this._timeslotService.play(evt.detail);
    }

    /**
     * @param evt
     */
    resume(evt) {
        this._timeslotService.resume(evt.detail);
    }

    /**
     * @param evt
     */
    stop(evt) {
        this._timeslotService.stop(evt.detail);
    }

    /**
     * @param evt
     */
    pause(evt) {
        this._timeslotService.pause(evt.detail);
    }

}
window.customElements.define('timeslot-view-list', TimeslotViewList);
