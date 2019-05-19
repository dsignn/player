import {html} from '@polymer/polymer/polymer-element';
import {DsignLocalizeElement} from "../../../../../elements/localize/dsign-localize";
import {lang} from './language';

/**
 *
 */
export class PaperTimeslotTags extends DsignLocalizeElement {

    static get template() {
        return html`
            SONO UN PAPER TIMESLOT TAGS
        `;
    }

    constructor() {
        super();
        this.resources = lang;
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
        tag = (this.data && Array.isArray(this.data.tags)) ? this.data.tags : [];
        return tag.join(" ");
    }
}

window.customElements.define('paper-timeslot-tags', PaperTimeslotTags);
