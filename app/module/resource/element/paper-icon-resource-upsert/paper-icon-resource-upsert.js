import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-pages/iron-pages';
import {lang} from './language';
import { FileEntity } from '../../src/entity/FileEntity';

/**
 * @customElement
 * @polymer
 */
class PaperIconResourceUpsert extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>
                :host {
                    display: block;
                } 

                #container {
                    background-repeat: no-repeat;
                    background-position: center center;
                    background-size: contain;
                    position: relative;
                    height: 100px;
                    width: 100px;

                    @apply --paper-icon-resource-upsert;
                }

                paper-icon-button {
                    position: absolute;
                    bottom: 4px;
                    right: 4px;
                    color: var(--text-primary-color);
                    background-color: var(--accent-color);
                    border-radius: 100%;
                    box-shadow: 0 3px 8px rgba(0,0,0,.23), 0 3px 8px rgba(0,0,0,.16);
                }

                #file {
                    display: none;
                }
            </style>
            <div id="container">
                <paper-icon-button id="tooltip" icon="ice-hockey:upload-file" on-tap="_openInput"></paper-icon-button>
                <paper-tooltip for="tooltip" position="{{position}}">{{localize('upload-label')}}</paper-tooltipn>
                <input type="file" id="file" on-change="_inputChange">
            </div>
            
            `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {

            name: {
                type: String,
            },

            tags: {
                type: Array,
            },
        
            position: {
                notify: true,
                value: 'bottom'
            },

            ref: {
                type: Object,
                notify: true,
                value: {type: "text/html", tags: []}
            },

            services: {
                value: {
                    _notify: "Notify",
                    _localizeService: 'Localize',
                    StorageContainerAggregate : {
                        _storage :"ResourceStorage"
                    },
                    _resoruceService:"ResourceService"
                }
            },

            /**
             * @type StorageInterface
             */
            _storage: {
                type: Object,
                notify: true,
                readOnly: true
            },

            /**
             * @type ResourceService
             */
            _resoruceService: {
                type: Object,
                notify: true,
                readOnly: true
            }
        };
    }

    static get observers() {
        return [
            'observerRef(_resoruceService, ref)'
        ]
    }

    /**
     * @param {Event} evt 
     */
    _openInput(evt) {
        this.$.file.click();
    }

    /**
     * @param {Event} evt 
     */
    _inputChange(evt) {

        let method = this.ref.id ? 'update' : 'save';

        this.ref = this._storage.getHydrator().hydrate(this.$.file.files[0]);
        this.ref.name = this.name ? this.name : '';
        this.ref.tags = this.tags ;
        this.ref.resourceToImport = this.$.file.files[0];
     
        this._storage[method](this.ref)
            .then((data) => {
                this.dispatchEvent(new CustomEvent('update-resource', {detail: data}));
                this.$.container.style.backgroundImage = `url("${this._resoruceService.getResourcePath(data)}?cache=${Date.now()}")`;
            });
    }

    /**
     * @param {*} ref 
     */
     observerRef(_resoruceService, ref)  {

        let image = 'none'
        if (!_resoruceService ||  !(ref instanceof FileEntity)) {
            this.$.container.style.backgroundImage = 'none';
        } else {
            this.$.container.style.backgroundImage = `url("${this._resoruceService.getResourcePath(ref)}?cache=${Date.now()}")`;
        }       
    }
}
window.customElements.define('paper-icon-resource-upsert', PaperIconResourceUpsert);