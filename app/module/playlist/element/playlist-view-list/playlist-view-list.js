import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import { StoragePaginationMixin } from "@dsign/polymer-mixin/storage/pagination-mixin";
import { StorageCrudMixin } from "@dsign/polymer-mixin/storage/crud-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import "../paper-playlist/paper-playlist";
import { lang } from './language';

/**
 * @customElement
 * @polymer
 */
class PlaylistViewList extends StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-playlist {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-playlist {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-playlist {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-playlist {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-playlist {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-playlist {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <div id="list">
                <template is="dom-repeat" items="[[entities]]" as="playlist">
                    <paper-playlist entity="{{playlist}}" 
                        on-change-rotation="_updateEntity"
                        on-change-context="_updateEntity"
                        on-change-adjust="_updateEntity"
                        on-change-volume="_updateEntity"
                        on-play="play"
                        on-resume="resume"
                        on-stop="stop"
                        on-pause="pause"
                        on-delete="_deleteEntity" 
                        on-update="_showUpdateView"
                        on-change-rotation="_updateEntity"
                        on-change-context="_updateEntity"
                        on-timeupdate="_updateTime">
                    </paper-playlist>
                </template>
            </div>
            <paper-pagination page="{{page}}" total-items="{{totalItems}}" item-per-page="{{itemPerPage}}" next-icon="next" previous-icon="previous"></paper-pagination>
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties() {
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
            services: {
                value: {
                    _notify: "Notify",
                    _localizeService: "Localize",
                    _playlistService: "PlaylistService",
                    StorageContainerAggregate: {
                        _storage: "PlaylistStorage"
                    }
                }
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
        this._playlistService.play(evt.detail);
    }

    /**
     * @param evt
     */
    resume(evt) {
        this._playlistService.resume(evt.detail);
    }

    /**
     * @param evt
     */
    stop(evt) {
        this._playlistService.stop(evt.detail);
    }

    /**
     * @param evt
     */
    pause(evt) {
        this._playlistService.pause(evt.detail);
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _updateTime(evt) {
        this._playlistService.changeTime(evt.detail.playlist, evt.detail.time);
    }
}
window.customElements.define('playlist-view-list', PlaylistViewList);
