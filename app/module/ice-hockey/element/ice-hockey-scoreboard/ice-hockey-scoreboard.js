import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";


import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import "../paper-ice-hockey-player/paper-ice-hockey-player";
import "../ice-hockey-add-player/ice-hockey-add-player";
import "../ice-hockey-add-score/ice-hockey-add-score";
import {lang} from './language';
import { IceHockeyMatchEntity } from '../../src/entity/IceHockeyMatchEntity';
import { IceHockeyScore } from '../../src/entity/embedded/IceHockeyScore';

/**
 * @customElement
 * @polymer
 */
class IceHockeyScoreboard extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style >
                .column {
                    @apply --layout-horizontal;
                }

                .j-between {
                    justify-content: space-between;
                }

                .j-center {
                    justify-content: center;
                    align-item: center;
                }

                .content-wrapper {
                    font-size: 24px;
                    width: 100%;
                    padding: 8px 0;
                }
                paper-listbox {
                    border-bottom-left-radius: 2px;
                    border-bottom-right-radius: 2px;
                    border-top-left-radius: 2px;
                    border-top-right-radius: 2px;
                    box-shadow: rgba(0, 0, 0, 0.14) 0px 2px 2px 0px, rgba(0, 0, 0, 0.12) 0px 1px 5px 0px, rgba(0, 0, 0, 0.2) 0px 3px 1px -2px;
                }

                paper-item.iron-selected {
                    background-color: var(--accent-color);
                }

                paper-ice-hockey-player {
                    margin-bottom:4px;
                }

                .score {
                    padding-left: 8px;
                    padding-right: 8px;
                }

                .title-name {
                    text-transform: capitalize;
                }
                
                .players {
                    flex-basis: 42%
                }

                .info {
                    flex-basis: 16%;
                    padding: 0 4px;
                }

                
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                    padding: 0;
                    height: 24px;
                    width: 24px;
                    line-height: 20px;
                    --paper-icon-button-disabled : {        
                        background-color: #c9c9c9 !important;
                    }
                }

            </style>
            <div class="column j-between">
                <div class="column content-wrapper j-center">
                    <div class="title-name">{{match.homeTeam.name}}</div>
                    <div class="score">{{homePoint}}</div>
                    <paper-icon-button id="plusScoreHome" icon="plus" class="circle" type="home" role="button" on-tap="addGenericPoint"></paper-icon-button>
                    <paper-tooltip for="plusScoreHome" position="right">{{localize('set-point')}}</paper-tooltip>
                </div>
                <div class="column content-wrapper j-center">
                    <div class="title-name">{{match.guestTeam.name}}</div>
                    <div class="score">{{guestPoint}}</div>
                    <paper-icon-button id="plusScoreGuest" icon="plus" class="circle" type="guest" role="button"  on-tap="addGenericPoint"></paper-icon-button>
                    <paper-tooltip for="plusScoreGuest" position="right">{{localize('set-point')}}</paper-tooltip>
                </div>
            </div>
            <div class="column">
                <div class="players">
                    <dom-repeat id="homeRepeat" items="{{match.homeTeam.players}}" as="player">
                        <template>
                            <paper-ice-hockey-player 
                                player="{{player}}" 
                                on-delete="deletePlayer" 
                                on-update="updatePlayerBtn" 
                                on-point="pointPlayer"
                                type="home">
                            </paper-ice-hockey-player>
                        </template>
                    </dom-repeat>
                </div>  
                <div class="info">
                    <paper-listbox id="listPeriods" on-iron-items-changed="changePeriod" on-iron-select="changePeriod">
                        <dom-repeat id="periods" items="{{match.periods}}" as="period">
                            <template>
                                <paper-item period="{{period.name}}">{{period.name}}</paper-item>
                            </template>
                        </dom-repeat>
                    </paper-listbox>
                </div>
                <div class="players">
                    <dom-repeat id="guestRepeat" items="{{match.guestTeam.players}}" as="player">
                        <template>
                            <paper-ice-hockey-player 
                                player="{{player}}" 
                                on-delete="deletePlayer" 
                                on-update="updatePlayerBtn" 
                                on-point="pointPlayer"
                                type="guest">
                            </paper-ice-hockey-player>
                        </template>
                    </dom-repeat>
                </div>
            </div>`
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
             match: {
                type: Object,
                notify: true,
                value: new IceHockeyMatchEntity(),
                observer: 'matchChange'

            },

            homePoint: {
                notify: true,
                value: null
            },

            guestPoint: {
                notify: true,
                value: null
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
         
        }
    }

    connectedCallback() {
        super.connectedCallback();

        let ele = document.createElement('paper-dialog');
        this.idPlayerDialog = this.__randomString();
        ele.setAttribute('id', this.idPlayerDialog);
        ele.setAttribute('with-backdrop', '');

        let addPlayer = document.createElement('ice-hockey-add-player');
        ele.appendChild(addPlayer);

        addPlayer.addEventListener('update', this.updatePlayer.bind(this));
        document.body.appendChild(ele);

        ele = document.createElement('paper-dialog');
        this.idScoreDialog = this.__randomString();
        ele.setAttribute('id', this.idScoreDialog);
        ele.setAttribute('with-backdrop', '');

        let addScore = document.createElement('ice-hockey-add-score');
        ele.appendChild(addScore);

        addScore.addEventListener('point', this.addScore.bind(this)); 
        document.body.appendChild(ele);
    }

    matchChange(match) {
        if (!match) {
            this.homePoint = null;
            this.guestPoint = null;
        } else {
            this.homePoint = match.getHomeScores().length;
            this.guestPoint = match.getGuestScores().length;
            this._syncPeriod(match);
        }
    }

    _syncPeriod(match) {
       
        let index = this.$.listPeriods.items.findIndex((ele) => {
            return ele.period === match.getCurrentPeriod().name;
        });

        this.$.listPeriods.selected = index;
    }

    /**
     * 
     * @returns {string}
     */
    __randomString() {
        return Math.random().toString(16).substr(2, 8);
    }

    changePeriod(evt) {
        // TODO cotroll papar autocomplete
        if (!evt.detail.item) {
            return;
        }
        
        this.match.getCurrentPeriod().name = evt.detail.item.period;

        this._storage.update(this.match)
            .then((data) => {
                console.log('AGGIORNATO', data);
            }).catch((error) => {
                console.error(error);
            });
    }

    /**
     * @param {Event} evt 
     */
    updatePlayerBtn(evt) {
        let ele = document.getElementById(this.idPlayerDialog);
        ele.querySelector('ice-hockey-add-player').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-player').player = evt.detail;
        ele.open();
    }

    /**
     * @param {Event} evt 
     */
    pointPlayer(evt) {
        
        let ele = document.getElementById(this.idScoreDialog);
        ele.querySelector('ice-hockey-add-score').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-score').player = evt.detail;
        ele.querySelector('ice-hockey-add-score').period = this.match.getCurrentPeriod();
        ele.open();
    }

    /**
     * @param {Event} evt 
     */
    updatePlayer(evt) {
        let ele = document.getElementById(this.idPlayerDialog);
        ele.close();

        let team = 'homeTeam';
        if (evt.target.typeTeam != 'home') {
            team = 'guestTeam';
        } 

        let index = this.match[team].players.findIndex((element) => {
            return element.id === evt.detail.player.id;
        });
     
        this.splice('match.' + team + '.players', index, 1, evt.detail.player );

        // TODO move to service
        this._storage.update(this.match)
            .then((data) => {
                console.log('AGGIORNATO', data);
            }).catch((error) => {
                console.error(error);
            });
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
            this.splice('match.homeTeam.players', index, 1);
        } else {
            this.splice('match.guestTeam.players', index, 1);
        }
    }

    addScore(evt) {
        let ele = document.getElementById(this.idScoreDialog);
        ele.close();
       
        if (evt.target.typeTeam === 'home') {
            this.match.homeScores.push(evt.detail.score);
            this.homePoint = this.match.getHomeScores().length;
        } else {
            this.match.guestScores.push(evt.detail.score);
            this.guestPoint = this.match.getGuestScores().length;
        }

        this._storage.update(this.match)
            .then((data) => {
                // LOG
            }).catch((error) => {
                console.error(error);
            });
    }

    /**
     * @param {*} evt 
     */
    addGenericPoint(evt) {
        if (evt.target.getAttribute('type') === 'home') {
            this.match.homeScores.push(new IceHockeyScore);
            this.homePoint = this.match.getHomeScores().length;
        } else {
            this.match.guestScores.push(new IceHockeyScore);
            this.guestPoint = this.match.getGuestScores().length;
        }

        this._storage.update(this.match)
            .then((data) => {
                // LOG
            }).catch((error) => {
                console.error(error);
            });
    }
}
window.customElements.define('ice-hockey-scoreboard', IceHockeyScoreboard);

