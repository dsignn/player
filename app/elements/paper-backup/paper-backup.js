import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../localize/dsign-localize";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

export class PaperBackup extends DsignLocalizeElement {

    static get template() {
        return html`
            <style>

                :host {
                    --paper-tooltip-opacity : 1;
                    
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
                    
                    paper-icon-button {
                        --paper-icon-button-disabled : {
                             background:  red;
                        }
                    }
                }
  
            </style>

            <paper-icon-button id="paperBackup" icon="backup" title="{{label}}" on-tap="backup"></paper-icon-button>
            <paper-tooltip id="paperTooltip" for="paperBackup" position="left">{{localize('run-backup')}}</paper-tooltip>
        `
    }

    static get properties() {
        return {

            archive : {
                observer: 'changeArchiveService'
            },

            services : {
                value : {
                    archive:  "Archive"
                }
            },
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param newValue
     */
    changeArchiveService(newValue) {
        if (!newValue) {
            return;
        }

        newValue.addEventListener('progress', this._progress.bind(this));
        newValue.addEventListener('close', this._close.bind(this));
        newValue.addEventListener('error', this._close.bind(this));
    }

    /**
     * @param evt
     * @private
     */
    _close(evt) {
        this._stoptHtmlBackup();
    }

    /**
     * @param evt
     * @private
     */
    _progress(evt) {
        // TODO
    }

    /**
     * @param {CustomEvent} evt
     */
    backup(evt) {

        this._startHtmlBackup();
        this.archive.archive();
    }

    /**
     * @private
     */
    _startHtmlBackup() {
        this.$.paperBackup.disabled = true;
        this.$.paperTooltip.innerHTML = this.localize('in-progress');
    }

    /**
     * @private
     */
    _stoptHtmlBackup() {
        this.$.paperBackup.disabled = false;
        this.$.paperTooltip.innerHTML = this.localize('run-backup');
    }
}

window.customElements.define('paper-backup', PaperBackup);
