import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import "@fluidnext-polymer/paper-pagination/paper-pagination";
import "@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons";
import { lang } from './language';
import { StorageEntityMixin } from '@dsign/polymer-mixin/storage/entity-mixin';
import { GenericPeriod } from '@dsign/library/src/sport/match/GenericPeriod';
import "../ice-hockey-add-player/ice-hockey-add-player";
import "../paper-ice-hockey-player/paper-ice-hockey-player";
import { IceHockeyPlayerEntity } from '../../src/entity/IceHockeyPlayerEntity';


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

                .players {
                    display: flex;
                    flex-wrap: wrap;
                }

                .header-players {
                    font-size: 20px;
                    padding: 10px 0;
                }

                paper-ice-hockey-player {
                    width: 32.5%;
                    margin-bottom: 6px;
                    margin-right: 6px;
                    ---paper-ice-hockey-player: {
                        height: 120px;
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
                                    <paper-icon-button icon="ice-hockey:add-user" class="circle" on-tap="addPlayerBtn" type="home"></paper-icon-button>
                                </div>
                                <div class="header-players">{{localize('list-player')}}</div>
                                <div class="players">
                                    <dom-repeat id="homeRepeat" items="{{entity.homeTeam.players}}" as="player">
                                        <template>
                                            <paper-ice-hockey-player player="{{player}}" on-delete="deletePlayer" on-update="updatePlayerBtn" type="home"></paper-ice-hockey-player>
                                        </template>
                                    </dom-repeat>
                                </div>
                            </div>
                            <div class="team">
                                <div class="column-wrapper justify-b">
                                    <paper-input label="{{localize('name-guest-team')}}" value="{{entity.guestTeam.name}}"></paper-input>
                                    <paper-icon-button icon="ice-hockey:add-user" class="circle" on-tap="addPlayerBtn" type="guest"></paper-icon-button>
                                </div>
                                <div class="header-players">{{localize('list-player')}}</div>
                                <div class="players">    
                                    <dom-repeat id="guestRepeat" items="{{entity.guestTeam.players}}" as="player" >
                                        <template>
                                            <paper-ice-hockey-player player="{{player}}" on-delete="deletePlayer" on-update="updatePlayerBtn" type="guest"></paper-ice-hockey-player>
                                        </template>
                                    </dom-repeat>
                                </div>
                            </div>
                        </div>
                        <div class="layout-horizontal layout-end-justified">
                            <paper-button on-tap="submitIceHockeyButton">{{localize('save')}}</paper-button>
                        </div>
                    </div>
                </form>
            </iron-form>`;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties() {
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

            idDialog: { 
                type: String,
            },

            /**
             * @type object
             */
            services: {
                value: {
                    _notify: "Notify",
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

        let ele = document.createElement('paper-dialog');
        this.idDialog = this.__randomString();
        ele.setAttribute('id', this.idDialog);
        ele.setAttribute('with-backdrop', '');

        let addPlayer = document.createElement('ice-hockey-add-player');
        ele.appendChild(addPlayer);

        addPlayer.addEventListener('add', this.addPlayer.bind(this));
        addPlayer.addEventListener('update', this.updatePlayer.bind(this));

        document.body.appendChild(ele);
    }

    /**
     * @param {Event} evt 
     */
    addPlayer(evt) {
      
        if (evt.detail.team === 'home') {

            this.push('entity.homeTeam.players', evt.detail.player);
        } else {
            this.push('entity.guestTeam.players', evt.detail.player);
        }
    }

    /**
     * @param {Event} evt 
     */
    updatePlayer(evt) {
        let ele = document.getElementById(this.idDialog);
        ele.close();

        let team = 'homeTeam';
        if (evt.target.typeTeam != 'home') {
            team = 'guestTeam';
        } 

        let index = this.entity[team].players.findIndex((element) => {
            return element.getId() === evt.detail.player.getId();
        });
     
        this.splice('entity.' + team + '.players', index, 1, evt.detail.player );
    }

    /**
     * @param {Event} evt 
     */
    addPlayerBtn(evt) {
        let ele = document.getElementById(this.idDialog);
        ele.querySelector('ice-hockey-add-player').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-player').player = new IceHockeyPlayerEntity();
        ele.open();
    }

    /**
     * @param {Event} evt 
     */
    updatePlayerBtn(evt) {
        let ele = document.getElementById(this.idDialog);
        ele.querySelector('ice-hockey-add-player').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-player').player = evt.detail;
        ele.open();
    }

    /**
     * @param {Event} evt 
     */
    deletePlayer(evt) {
    
        let eleId = 'guestRepeat';
        if (evt.target.getAttribute('type') === 'home') {
            eleId = 'homeRepeat';
        }
        
        let index = this.$[eleId].items.findIndex((ele) => {
            return ele.id === evt.detail.id;
        });

     
        if (evt.target.getAttribute('type') === 'home') {
            this.splice('entity.homeTeam.players', index, 1);
        } else {
            this.splice('entity.guestTeam.players', index, 1);
        }
    }

    /**
     * 
     * @returns {string}
     */
    __randomString() {
        return Math.random().toString(16).substr(2, 8);
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
