import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import {lang} from './language';
import { StorageEntityMixin } from '@dsign/polymer-mixin/storage/entity-mixin';

/**
 * @customElement
 * @polymer
 */
class IceHockeyViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
            <style>
                #list {
                    padding-top: var(--padding-top-view-list);
                    @apply --layout-horizontal;
                    @apply --layout-wrap;
                }
                
                @media (max-width: 500px) {
                    paper-monitor {
                        flex-basis: 100%;
                    }
                }
    
                @media (min-width: 501px) and (max-width: 900px) {
                    paper-monitor {
                        flex-basis: 50%;
                    }
                }
    
                @media (min-width: 901px) and (max-width: 1200px) {
                    paper-monitor {
                        flex-basis: 33.3%;
                    }
                }
    
                @media (min-width: 1201px) and (max-width: 1500px) {
                    paper-monitor {
                        flex-basis: 25%;
                    }
                }
    
                @media (min-width: 1501px) and (max-width: 1919px) {
                    paper-monitor {
                        flex-basis: 20%;
                    }
                }
    
                @media (min-width: 1920px) {
                    paper-monitor {
                        flex-basis: 16.6%;
                    }
                }
            </style>
            <slot name="header"></slot>
            <slot name="header"></slot>
            <iron-form id="formIceHockey">
                <form method="post">
                    <div id="container">
                        <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                        <div class="layout-horizontal layout-end-justified">
                            <paper-button on-tap="submitIceHockeyButton">{{localize('save')}}</paper-button>
                        </div>
                    </div>
                </form>
            </iron-form> 
            `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {

            /**
             * @type number
             */
            selected: {
                type: Number,
                notify: true,
                value: 0
            },

            /**
             * @type MonitorEntity
             */
            entitySelected: {
                notify: true
            },

            /**
             * @type object
             */
            services : {
                value : {
                    _notify : "Notify",
                    _localizeService: 'Localize',
                    "StorageContainerAggregate": {
                        _storage: "IceHockeyMatchStorage"
                    }
                }
            }
        };
    }

    static get observers() {
        return [
            'observerPaginationEntities(page, itemPerPage, _storage)'
        ]
    }

    ready() {
        super.ready();
        this.$.formIceHockey.addEventListener('iron-form-presubmit', this.submitIceHockey.bind(this));
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _showUpdateView(evt) {
        this.entitySelected = evt.detail;
        this.selected = 2;
    }

    /**
     * @private
     */
    _deleteCallback() {
        this._notify.notify(this.localize('notify-delete'));
    }


    /**
     * @param evt
     */
    submitIceHockeyButton(evt) {
        this.$.formIceHockey.submit();
    }

    submitIceHockey(evt) {
        evt.preventDefault();

        let method = this.getStorageUpsertMethod();

        this._storage[method](this.entity)
            .then((data) => {

                if (method === 'save') {
                    this.entity = this._storage.getHydrator().hydrate({});
                    this.$.formIceHockey.reset();
                }
                
                this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
            });
    }
}
window.customElements.define('ice-hockey-view-upsert', IceHockeyViewUpsert);
