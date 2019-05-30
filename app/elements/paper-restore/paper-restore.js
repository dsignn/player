import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../localize/dsign-localize";
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';

import {lang} from './language/language';

export class PaperRestore extends DsignLocalizeElement {

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

            <paper-icon-button id="paperRestore" icon="restore" title="{{label}}" on-tap="restore"></paper-icon-button>
            <paper-tooltip id="paperTooltip" for="paperRestore" position="left">{{localize('run-restore')}}</paper-tooltip>
            <paper-dialog id="restoreDialog" no-overlap horizontal-align="center" vertical-align="top" entry-animation="fade-in-animation" exit-animation="fade-out-animation">
                <div class="container">
                    <paper-input-file id="restoreFile"></paper-input-file>
                    <paper-button on-tap="restore">{{localize('import')}}</paper-button>
                </div>
            </paper-dialog>
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
    }


    /**
     * @param {CustomEvent} evt
     */
    restore(evt) {
        console.log('restore', evt);
        this.$.restoreDialog.open();

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

window.customElements.define('paper-restore', PaperRestore);
