import {html} from '@polymer/polymer/polymer-element';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {DsignLocalizeElement} from "../../../../../elements/localize/dsign-localize";
import {lang} from './language';
import {EntityListBehavior} from "../../../../../elements/storage/entity-list-behaviour";
import "../../paper-timeslot/paper-timeslot";

/**
 *
 */
export class PaperTimeslotTags extends mixinBehaviors([EntityListBehavior], DsignLocalizeElement) {

    static get template() {
        return html`
            <template is="dom-repeat" items="[[entities]]" as="timeslot">
                <paper-timeslot entity="{{timeslot}}" on-play="play" on-resume="resume" on-stop="stop" on-pause="pause"
                        hide-crud
                        remove-crud>
                </paper-timeslot>
            </template>
        `;
    }

    static get properties () {
        return {

            data : {
                observer: "_changedData"
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
            'observerFilter(storage, filter)'
        ]
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param storage
     * @param filter
     */
    observerFilter(storage, filter) {

        if (!storage || Object.entries(filter).length === 0) {
            return;
        }

        this.getEntities();
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

window.customElements.define('paper-timeslot-tags', PaperTimeslotTags);
