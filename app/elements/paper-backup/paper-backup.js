import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-spinner/paper-spinner';
import {lang} from './language/language';

export class PaperBackup extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    display:block; 
                    padding: 5px;
                    width: 95px;
                    height: 95px;
                    border-radius: 6px;
                    --paper-tooltip-opacity : 1;
                    
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
                }

                :host(:hover){
                    background-color: #e8f0fe;
                }

                paper-icon-button {
                      
                    --paper-icon-button : {
                        width: 60px;
                        height: 60px;
                        color: var(--default-primary-color);
                    }
                    --paper-icon-button-disabled : {
                         background:  red;
                    }
                }

                paper-spinner {
                    display:none;
                    margin-top: 6px;
                    margin-bottom: 28px;
                    --paper-spinner-color: var(--accent-color);
                    --paper-spinner-layer-1-color: var(--accent-color);
                    --paper-spinner-layer-2-color: var(--accent-color);
                    --paper-spinner-layer-3-color: var(--accent-color);
                    --paper-spinner-layer-4-color: var(--accent-color);
                }
  
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }
            </style>
            <div class="container">
                <paper-spinner id="spinner"></paper-spinner>
                <paper-icon-button id="paperBackup" icon="backup" title="{{label}}" on-tap="backup"></paper-icon-button>
                <div style="font-size: 16px;">Backup</div>
            </div>
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
        this._working(false);
    }

    /**
     * @param evt
     * @private
     */
    _progress(evt) {
        this._working(true);
    }

    _working(isWorking) {
        if (isWorking) {
            this.$.paperBackup.style.display = 'none';
            this.$.spinner.active = true;
            this.$.spinner.style.display = 'block';
        } else {
            this.$.spinner.style.display = 'none';
            this.$.spinner.active = false;
            this.$.paperBackup.style.display = 'block';
        }
    }

    /**
     * @param {CustomEvent} evt
     */
    backup(evt) {
        this._archive.archive();
    }
}

window.customElements.define('paper-backup', PaperBackup);
