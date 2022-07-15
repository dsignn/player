import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import {lang} from './language';
import { StorageEntityMixin } from '@dsign/polymer-mixin/storage/entity-mixin';
import { GenericPeriod } from '@dsign/library/src/sport/match/GenericPeriod';
import "../ice-hockey-add-player/ice-hockey-add-player";

/**
 * @customElement
 * @polymer
 */
class IceHockeyViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
            <style>
                .column-wrapper {
                    @apply --layout-horizontal;
                } 

                .justify-b {
                    justify-content: space-between;
                }

                .team {
                    flex-basis: 50%;
                }

                .team:first-child {
                    padding-right: 6px;
                }

                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                    --paper-icon-button-disabled : {        
                        background-color: #c9c9c9 !important;
                    }
                }

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

                #period {
                    width: 100%;
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
                        <div>
                            <div class="column-wrapper">
                                <paper-input id="period" name="period" label="{{localize('period')}}" on-value-changed="_changePeriod" ></paper-input>
                                <paper-icon-button id="paperIconPeriod" icon="plus" class="circle" on-tap="addPeriod" disabled></paper-icon-button>
                            </div>
                            <paper-chips id="chips" text-property="name" items="{{entity.periods}}"></paper-chips>
                        </div>
                        <div class="column-wrapper">
                            <div class="team">
                                <div class="column-wrapper justify-b">
                                    <paper-input label="{{localize('name-home-team')}}" value="{{entity.homeTeam.name}}"></paper-input>
                                    <paper-icon-button icon="plus" class="circle" on-tap="addPlayer" type="home"></paper-icon-button>
                                </div>
                            </div>
                            <div class="team">
                                <div class="column-wrapper justify-b">
                                    <paper-input label="{{localize('name-guest-team')}}" value="{{entity.guestTeam.name}}"></paper-input>
                                    <paper-icon-button icon="plus" class="circle" on-tap="addPlayer" type="guest"></paper-icon-button>
                                </div>
                            </div>
                        </div>
                        <div class="layout-horizontal layout-end-justified">
                            <paper-button on-tap="submitIceHockeyButton">{{localize('save')}}</paper-button>
                        </div>
                    </div>
                </form>
            </iron-form>
            <paper-dialog id="playerDialog" with-backdrop auto-fit-on-attach always-on-top horizontal-align="center" vertical-align="top">
                <div class="container">
                    <paper-input label="{{localize('firstname-player')}}"></paper-input>
                    <paper-input label="{{localize('lastname-player')}}"></paper-input>
                </div>
            </paper-dialog>`;
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

    ready() {
        super.ready();
        this.$.formIceHockey.addEventListener('iron-form-presubmit', this.submitIceHockey.bind(this));
    }

    connectedCallback() {
        super.connectedCallback();
      
        if(!document.getElementById('iceHockerPlayerDialog')) {
            let ele = document.createElement('paper-dialog');
            ele.setAttribute('id', 'iceHockerPlayerDialog');
            ele.setAttribute('with-backdrop', '');
            
            let addPlayer = document.createElement('ice-hockey-add-player');
            ele.appendChild(addPlayer);
            
            document.body.appendChild(ele);
        }
      }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _showUpdateView(evt) {
        this.entitySelected = evt.detail;
        this.selected = 2;
    }

    computePeriod(item) {
        return item.name;
    }

    _changePeriod(evt) {
        let value = true;
        if (evt.target.value) {
            value = false;
        }
        this.$.paperIconPeriod.disabled = value;
    }

    addPlayer(evt) {
       
        let ele = document.getElementById('iceHockerPlayerDialog');
        ele.open();
    }

    addPeriod(evt) {
        let period = new GenericPeriod(this.$.period.value);
        this.$.chips.add(period);
     //   this.entity.periods.push(period);
        this.$.period.value = null;
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
