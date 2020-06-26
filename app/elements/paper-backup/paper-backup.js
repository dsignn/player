import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

export class PaperBackup extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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

            /**
             * @type Archive
             */
            _archive : {
                type: Object,
                readOnly: true,
                observer: 'changeArchive'
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _archive:  "Archive",
                    _localizeService: 'Localize'
                }
            },
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param {Archive} archiveService
     */
    changeArchive(archiveService) {
        if (!archiveService) {
            return;
        }

        archiveService.addEventListener('progress', this._progress.bind(this));
        archiveService.addEventListener('close', this._close.bind(this));
        archiveService.addEventListener('error', this._close.bind(this));
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
        this._archive.archive();
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
