import {html, PolymerElement} from '@polymer/polymer/polymer-element';
import '@fluidnext-polymer/paper-chip/paper-chips'
import '@polymer/paper-input/paper-input'

/**
 *
 */
export class PaperTimeslotTagsData extends PolymerElement {

    static get template() {
        return html`
            <paper-input id="paperInput" label="{{label}}" on-keypress='sendInput'></paper-input>
            <paper-chips id="paperChips" on-fill-items="readyData" on-empty-items="unreadyData"></paper-chips>
        `;
    }

    static get properties () {
        return {

            label: {
                type: String
            }
        };
    }

    /**
     * @param evt
     */
    sendInput(evt) {

        if (evt.code === 'Enter' && evt.target.value && evt.target.value != '') {
            this.$.paperChips.add(evt.target.value);

            evt.target.value = null;
        }
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
        return this.$.paperChips.items;
    }
}

window.customElements.define('paper-timeslot-tags-data', PaperTimeslotTagsData);
