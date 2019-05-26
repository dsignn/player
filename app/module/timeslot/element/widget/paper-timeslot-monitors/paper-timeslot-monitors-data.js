import {html} from '@polymer/polymer/polymer-element';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-input/paper-input';
import {DsignLocalizeElement} from "../../../../../elements/localize/dsign-localize";
import {EntityPaginationBehavior} from "../../../../../elements/storage/entity-pagination-behaviour";

/**
 *
 */
export class PaperTimeslotMonitorsData extends DsignLocalizeElement {

    static get template() {
        return html`
            <paper-autocomplete id="paperInput" label="{{label}}" text-property="name" value-property="name" on-autocomplete-selected="_selectMonitor" on-autocomplete-change="_searchMonitor" remote-source></paper-autocomplete>
            <paper-chips id="paperChips" on-fill-items="readyData" on-empty-items="unreadyData" text-property="name"></paper-chips>
        `;
    }

    static get properties () {
        return {

            label: {
                type: String
            },

            services : {
                value : {
                    "monitorService": 'MonitorService'
                }
            }
        };
    }

    static get observers() {
        return [
            'observerStorage(storageContainerAggregate, storageService)'
        ]
    }

    /**
     * @param evt
     * @private
     */
    _searchMonitor(evt) {
        let enableMonitor = this.monitorService.getEnableMonitor();

        let filter = enableMonitor.getMonitors({nested: true}).filter(
            element => {
                return element.name.search(new RegExp(evt.detail.value.text, 'i')) > -1;
            }
        );

        evt.detail.target.suggestions(
            filter
        );
    }

    /**
     * @param evt
     * @private
     */
    _selectMonitor(evt) {

        this.$.paperChips.add(evt.detail.value);
        setTimeout(
            function() {
                this.clear();
            }.bind(evt.target),
            200
        );
    }

    /**
     * @param evt
     */
    readyData(evt) {
        this.dispatchEvent(new CustomEvent('ready-data'));
    }

    /**
     * @param evt
     */
    unreadyData(evt) {
        this.dispatchEvent(new CustomEvent('unready-data'));
    }

    /**
     * @return {*}
     */
    getData() {
        let data = [];
        let reference;
        for (let cont = 0;  this.$.paperChips.items.length > cont; cont++) {
            reference = new (require("@dsign/library").storage.entity.EntityNestedReference)();
            reference.setCollection('monitor');
            reference.setId(this.$.paperChips.items[cont].id);
            reference.setParentId(this.monitorService.getEnableMonitor().getId());
            reference.name = this.$.paperChips.items[cont].name;
            data.push(reference);
        }
        return data;
    }
}

window.customElements.define('paper-timeslot-monitors-data', PaperTimeslotMonitorsData);
