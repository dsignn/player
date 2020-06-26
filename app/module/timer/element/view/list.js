import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StoragePaginationMixin} from "@dsign/polymer-mixin/storage/pagination-mixin";
import {StorageCrudMixin} from "@dsign/polymer-mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import "../paper-timer/paper.timer";

import {lang} from './language/list-language';

/**
 * @customElement
 * @polymer
 */
class TimerViewList extends  StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-timer {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-timer {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-timer {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-timer {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-timer {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-timer {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="timer">
                   <paper-timer 
                    entity="{{timer}}" 
                    on-delete="_deleteEntity" 
                    on-update="_showUpdateView"
                    on-play="play"
                    on-stop="stop"
                    on-pause="pause"
                    on-resume="resume">
                    </paper-timer>
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
                        _storage: "TimerStorage"
                    },
                    _timerService: "TimerService"
                }
            },


            /**
             * @type Notify
             */
            _timerService: {
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

    /**
     * @param evt
     */
    play(evt) {
        this._timerService.play(evt.detail)
            .catch((err) => {
                    console.error(err)
                }
            )   ;
    }

    /**
     * @param evt
     */
    stop(evt) {
        this._timerService.stop(evt.detail)
            .catch((err) => {
                    console.error(err)
                }
            );
    }

    /**
     * @param evt
     */
    pause(evt) {
        this._timerService.pause(evt.detail)
            .catch((err) => {
                    console.error(err)
                }
            );
    }

    /**
     * @param evt
     */
    resume(evt) {
        this._timerService.resume(evt.detail).
            catch((err) => {
                    console.error(err)
                }
            );
    }
}
window.customElements.define('timer-view-list', TimerViewList);
