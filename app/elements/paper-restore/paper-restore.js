import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import {lang} from './language/language';

export class PaperRestore extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    --paper-tooltip-opacity : 1;
                    display:block; 
                    padding: 5px;
                    width: 95px;
                    height: 95px;
                    border-radius: 6px;
                    --paper-tooltip : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                        font-size: 16px;
                    }
                    
                    --paper-button : {
                        background-color: var(--accent-color);
                        background:  var(--accent-color);
                    };
                    
                    --paper-button-disabled : {
                        background-color: var(--divider-color);
                        background:  var(--divider-color);
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

                paper-dialog {
                    width: 250px;
                    max-width: 250px !important;
                    left: unset !important;
                    right: 0px;
                }

                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                }

                .container-dialog {
                    min-height: 150px;
                }
  
            </style>
            <div class="container">
                <paper-icon-button id="paperRestore" icon="restore" title="{{label}}" on-tap="openDialog"></paper-icon-button>
                <!--<paper-tooltip id="paperTooltip" for="paperRestore" position="left">{{localize('run-restore')}}</paper-tooltip>-->
                <div style="font-size: 16px;">Restore</div>
            </div>
            <paper-dialog id="restoreDialog" auto-fit-on-attach always-on-top horizontal-align="center" vertical-align="top">
                <div class="container-dialog">
                    <paper-input-file id="restoreFile" files="{{files}}" accept="application/zip"></paper-input-file>
                    <paper-button id="importButton" on-tap="restore" disabled>{{localize('import')}}</paper-button>
                </div>
            </paper-dialog>
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
             * @type Array
             */
            files : {
                observer: 'changeFiles'
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

        archiveService.addEventListener('close-extract', this._close.bind(this));
        archiveService.addEventListener('error-extract', this._close.bind(this));
    }

    /**
     * @param newValue
     */
    changeFiles(newValue) {
        if (!newValue || (Array.isArray(newValue) && newValue.length === 0)) {
            this.$.importButton.disabled = true;
            return;
        }

        this.$.importButton.disabled = false;
    }

    /**
     * @param {CustomEvent} evt
     */
    restore(evt) {

        this._startHtmlBackup();
        this._archive.restore(this.files[0].path)
            .then((data) => {
                console.log('Restore ok', data)
            })
            .catch((err) => {
                console.error(err)
            });
    }

    /**
     * @param evt
     */
    openDialog(evt) {
        this.$.restoreDialog.open();
    }

    /**
     * @param evt
     * @private
     */
    _close(evt) {
        this._stoptHtmlBackup();
    }

    /**
     * @private
     */
    _startHtmlBackup() {
        this.$.paperRestore.disabled = true;
        //this.$.paperTooltip.innerHTML = this.localize('in-progress');
        // TODO REFACTOR
        setTimeout(
            () => {
                this.$.restoreFile.reset();
            },
            500
        );
        this.$.restoreDialog.close();
    }

    /**
     * @private
     */
    _stoptHtmlBackup() {
        this.$.paperRestore.disabled = false;
        //this.$.paperTooltip.innerHTML = this.localize('run-backup');
    }
}

window.customElements.define('paper-restore', PaperRestore);
