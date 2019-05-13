import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityPaginationBehavior} from "../../../../elements/storage/entity-pagination-behaviour";
import "../paper-timeslot/paper-timeslot";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import {lang} from './language/list-language';

/**
 * @customElement
 * @polymer
 */
class TimeslotViewList extends mixinBehaviors([EntityPaginationBehavior], DsignLocalizeElement) {

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
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-timeslot {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-timeslot {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-timeslot {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-timeslot {
                        flex-basis: 20%;
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
                <template is="dom-repeat" items="[[entities]]" as="resource">
                    <paper-timeslot entity="{{resource}}" 
                        on-play="play"
                        on-resume="resume"
                        on-stop="stop"
                        on-pause="pause"
                        on-delete="_deleteEntity" 
                        on-update="_showUpdateView"
                        on-change-rotation="_updateEntity"
                        on-change-context="_updateEntity">
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
                    "storageContainerAggregate": 'StorageContainerAggregate',
                    "timeslotService" : "TimeslotService"
                }
            },

            storageService : {
                value: 'TimeslotStorage'
            }
        };
    }

    static get observers() {
        return [
            'observerStorage(storageContainerAggregate, storageService)',
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

    /**
     * @param evt
     */
    play(evt) {
        this.timeslotService.play(evt.detail);
    }

    /**
     * @param evt
     */
    resume(evt) {
        this.timeslotService.resume(evt.detail);
    }

    /**
     * @param evt
     */
    stop(evt) {
        this.timeslotService.stop(evt.detail);
    }

    /**
     * @param evt
     */
    pause(evt) {
        this.timeslotService.pause(evt.detail);
    }

}
window.customElements.define('timeslot-view-list', TimeslotViewList);
