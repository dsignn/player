import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageListMixin} from "@dsign/polymer-mixin/storage/list-mixin";
import {lang} from './language';
import "../../paper-timeslot/paper-timeslot";

/**
 *
 */
export class PaperTimeslotTags extends StorageListMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
            <template is="dom-repeat" items="[[entities]]" as="timeslot" sort="fromStatus">
                <paper-timeslot entity="{{timeslot}}" 
                    on-play="play" 
                    on-resume="resume"
                    on-stop="stop" 
                    on-pause="pause" 
                    hide-crud 
                    remove-crud>
                </paper-timeslot>
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
                        _storage: "TimeslotStorage"
                    },
                    _timeslotService : "TimeslotService"
                }
            },

            /**
             * @type TimeslotService
             */
            _timeslotService: {
                type: Object,
                readOnly: true
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

        // TODO event only from user interface
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

window.customElements.define('paper-timeslot-tags', PaperTimeslotTags);
