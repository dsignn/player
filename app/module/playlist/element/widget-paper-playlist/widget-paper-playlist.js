import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageListMixin} from "@dsign/polymer-mixin/storage/list-mixin";
import {Storage} from "@dsign/library/src/storage/Storage.js";
import {lang} from './language';
import "../paper-playlist/paper-playlist";

/**
 *
 */
export class WidgetPaperPlaylist extends StorageListMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
            <template is="dom-repeat" items="[[entities]]" as="playlist" sort="fromStatus">
                <paper-playlist entity="{{playlist}}" 
                    on-play="play" 
                    on-resume="resume"
                    on-stop="stop" 
                    on-pause="pause" 
                    hide-crud 
                    remove-crud>
                </paper-playlist>
            </template>
        `;
    }

    static get properties () {
        return {

            /**
             *
             */
            data : {
                observer: "_changedData"
            },

            /**
             *
             */
            _storage : {
                observer: "_changedStorage"
            },

            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _storage: "PlaylistStorage"
                    }
                }
            }
        };
    }

    static get observers() {
        return [
            // Observer method name, followed by a list of dependencies, in parenthesis
            'observeList(_storage, filter)'
        ]
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param newValue
     * @private
     */
    _changedStorage(newValue) {

        if (!newValue) {
            return;
        }

        newValue.getEventManager()
            .on(Storage.POST_SAVE, this._updateList.bind(this))
            .on(Storage.POST_UPDATE, this._updateList.bind(this))
            .on(Storage.POST_REMOVE, this._updateList.bind(this));
    }

    /**
     * @param newValue
     * @private
     */
    _changedData(newValue) {

        if (!newValue) {
            return;
        }

        this.filter = {
            'tags' : newValue
        };
    }

    /**
     * @param {StorageInterface} storage
     * @param {Array} filter
     */
    observeList(storage, filter) {

        if (!storage || !filter) {
            return;
        }

        this._updateList();
    }

    /**
     * @private
     */
    _updateList() {
        this._storage.getAll(this.filter)
            .then((timeslots) => {
                this.entities = timeslots;
            })
            .catch((error) => {
                console.error(error)
            })
    }

    /**
     * @param ele1
     * @param ele2
     */
    fromStatus(ele1, ele2) {
        let compare = -1;
        switch (true) {
            case ele1.status === "idle" && ele1 !== ele2 :
                compare =  1;
                break;
            case ele1.status === "pause" && ele1 !== ele2 && ele2.status !== "idle":
                compare =  1;
                break;
            case ele1.name < ele2.name :
                compare =  1;
                break;
        }
        return compare
    }


    /**
     * @return {string}
     */
    getTitle() {
        return this.localize('title');
    }

    /**
     * @return {string}
     */
    getSubTitle() {
        let tag = [];
        tag = (this.data && Array.isArray(this.data)) ? this.data : [];
        return tag.join(" ");
    }
}

window.customElements.define('widget-paper-playlist', WidgetPaperPlaylist);