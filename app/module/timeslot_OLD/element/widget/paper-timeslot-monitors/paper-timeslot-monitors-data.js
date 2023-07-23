import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-input/paper-input';

/**
 *
 */
export class PaperTimeslotMonitorsData extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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


            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    _monitorService: "MonitorService"
                }
            },

            /**
             * @type MonitorService
             */
            _monitorService: {
                type: Object,
                readOnly: true
            }
        };
    }

    /**
     * @param evt
     * @private
     */
    _searchMonitor(evt) {
        let enableMonitor = this._monitorService.getEnableMonitor();

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
            reference.setParentId(this._monitorService.getEnableMonitor().getId());
            reference.name = this.$.paperChips.items[cont].name;
            data.push(reference);
        }
        return data;
    }
}

window.customElements.define('paper-timeslot-monitors-data', PaperTimeslotMonitorsData);
