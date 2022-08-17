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
import '../../../../elements/paper-chrono/paper-chrono';
import {lang} from './language';
import { IceHockeyMatchEntity } from '../../src/entity/IceHockeyMatchEntity';
import { IceHockeyScore } from '../../src/entity/embedded/IceHockeyScore';
import { IceHockeyPlayerEntity } from '../../src/entity/IceHockeyPlayerEntity';
import { IceHockeyScoreboardService } from '../../src/IceHockeyScoreboardService';

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

                .row {
                    @apply --layout-vertical;
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

                .score-content {
                    flex: 1;
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

                #plusPlayerGuest,
                #plusPlayerHome {
                    margin-left: 8px;
                }
                
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                    padding: 0;
                    height: 30px;
                    width: 30px;
                    line-height: 20px;
                    --paper-icon-button-disabled : {        
                        background-color: #c9c9c9 !important;
                    }
                }

                .team-data {
                    padding: 0 10px;
                    flex: 1;
                }

                .action-team {
                    display: flex;
                    justify-content: end;
                }

                .action-team.guest { 
                    justify-content: start;
                }

                paper-menu-button {
                    padding: 0;
                    font-size: 80px;
                    width: 120px;
                    text-align: center;
                }

            </style>
            <div class="column j-between">
                <div class="column content-wrapper j-center">
                    <paper-icon-resource-upsert ref="{{match.homeTeam.logo}}" position="left" on-update-resource="updateScoreEvt"></paper-icon-resource-upsert>
                    <div class="row team-data">
                        <div style="width: 100%;">
                            <paper-input value="{{match.homeTeam.name}}" label="{{localize('team-name')}}" on-value-changed="updateScoreEvt"> </paper-input>
                        </div>
                        <div class="action-team"> 
                            <paper-icon-button id="plusScoreHome" icon="plus" class="circle" type="home" role="button" on-tap="addGenericScore"></paper-icon-button>
                            <paper-tooltip for="plusScoreHome" position="bottom">{{localize('set-point')}}</paper-tooltip>
                            <paper-icon-button id="plusPlayerHome" icon="ice-hockey:add-user" class="circle" type="home" on-tap="addPlayerBtn"></paper-icon-button>
                            <paper-tooltip for="plusPlayerHome" position="bottom">{{localize('add-player')}}</paper-tooltip>
                        </div>
                    </div>         
                    <paper-menu-button>
                        <div class="score" slot="dropdown-trigger">{{homePoint}}</div>
                        <paper-listbox slot="dropdown-content">
                            <dom-repeat id="homeRepeatScore" items="{{match.homeScores}}" as="score">
                                <template>
                                    <paper-item score="{{score}}" index="{{index}}" typeTeam="home" on-tap="removeScore">
                                        <div class="score-content">{{computeScore(score)}}</div>
                                        <iron-icon icon="minus" class="circle" ></iron-icon>
                                    </paper-item>
                                </template>
                            </dom-repeat>
                        </paper-listbox>
                    </paper-menu-button>    
                </div>
                <div class="column content-wrapper j-center">
                    <paper-menu-button>
                        <div class="score" slot="dropdown-trigger">{{guestPoint}}</div>
                        <paper-listbox slot="dropdown-content">
                            <dom-repeat id="guestRepeatScore" items="{{match.guestScores}}" as="score">
                                <template>
                                    <paper-item score="{{score}}" index="{{index}}" typeTeam="guest" on-tap="removeScore">
                                        <div class="score-content">{{computeScore(score)}}</div>
                                        <iron-icon icon="minus" class="circle" ></iron-icon>
                                    </paper-item>
                                </template>
                            </dom-repeat>
                        </paper-listbox>
                    </paper-menu-button>    
                    <div class="row team-data">
                        <div style="width: 100%;">
                            <paper-input value="{{match.guestTeam.name}}" label="{{localize('team-name')}}" on-value-changed="updateScoreEvt"> </paper-input>
                        </div>
                        <div class="action-team guest"> 
                            <paper-icon-button id="plusScoreGuest" icon="plus" class="circle" type="guest" role="button"  on-tap="addGenericScore"></paper-icon-button>
                            <paper-tooltip for="plusScoreGuest" position="bottom">{{localize('set-point')}}</paper-tooltip>
                            <paper-icon-button id="plusPlayerGuest" icon="ice-hockey:add-user" class="circle" type="guest" on-tap="addPlayerBtn"></paper-icon-button>
                            <paper-tooltip for="plusPlayerGuest" position="bottom">{{localize('add-player')}}</paper-tooltip>
                        </div>
                    </div>   
                    <paper-icon-resource-upsert ref="{{match.guestTeam.logo}}" position="left" on-update-resource="updateScoreEvt"></paper-icon-resource-upsert>
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
                                on-point="scorePlayerBtn"
                                type="home"
                                direction="horizontal">
                            </paper-ice-hockey-player>
                        </template>
                    </dom-repeat>
                </div>  
                <div class="info">
                    <paper-chrono id="chrono" time="{{match.time}}" 
                        on-data="updateScoreEvt" 
                        on-play-timer="updateScoreEvt"
                        on-pause-timer="updateScoreEvt"
                        on-resume-timer="updateScoreEvt"
                        on-stop-timer="updateScoreEvt"></paper-chrono>
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
                                on-point="scorePlayerBtn"
                                type="guest"
                                direction="horizontal">
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
                    },
                    scoreboardService: 'IceHockeyScoreboardService'
                }
            },

            scoreboardService: {
                observer: 'scoreboardServiceChange'
            } ,
            
            _localizeService: {
                readOnly: true,
                observer: 'localizeChange'
            }
        }
    }

    localizeChange(service) {
        let resources = this.shadowRoot.querySelectorAll('paper-icon-resource-upsert');
        resources.forEach(element => {
            element.name = this.localize('score-logo');
            element.tags = [this.localize('score-tag')];
        });
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
        addPlayer.addEventListener('add', this.addPlayer.bind(this));
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

    matchChange(newMatch, oldMatch) {
       
        // TODO pensaci
        newMatch.time.id = 'iceHockeyTime';

        if (!newMatch || !newMatch.id) {
            this.homePoint = null;
            this.guestPoint = null;
        } else {
            this.homePoint = newMatch.getHomeScores().length;
            this.guestPoint = newMatch.getGuestScores().length;
            this._syncPeriod(oldMatch);
        }

        
    }

    _syncPeriod(match) {
       
        let index = this.$.listPeriods.items.findIndex((ele) => {
            return ele.period === match.getCurrentPeriod().name;
        });

        this.$.listPeriods.selected = index;
    }

    computeScore(score) {
        var player = undefined;
        if (score.playerReference && score.playerReference.id) {

            player = this.match.getGuestTeam().getPlayers().find((ele) => {
                return score.playerReference.id === ele.id;
            });

            if (!player) {
                player = this.match.getHomeTeam().getPlayers().find((ele) => {
                    return score.playerReference.id === ele.id;
                });
            }
        }

        if (player) {
            return `${player.lastName} ${player.lastName} ${score.time}`;
        } else {
            return this.localize('anonimus');
        }
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
        this._updateScoreboard();
    }

    scoreboardServiceChange(service) {
        if (!service) {
            return;
        }

        service.getEventManager().on(IceHockeyScoreboardService.CHANGE_SCOREBOARD_MATCH, (evt) => {
            this.match = evt.data;
        });
    }

    /**
     * @param {Event} evt 
     */
    updateScoreEvt(evt) {
        this._updateScoreboard();
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
    addPlayer(evt) {

        var type = evt.detail.team;
        let team = 'homeTeam';

        if (type !== 'home') {
            team = 'guestTeam';
        } 
        
        this.push(`match.${team}.players`, evt.detail.player);
        this._updateScoreboard(type);
    }

    /**
     * @param {Event} evt 
     */
    addPlayerBtn(evt) {
        let ele = document.getElementById(this.idPlayerDialog);
        ele.querySelector('ice-hockey-add-player').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-player').player = new IceHockeyPlayerEntity();
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
     
        this.splice(`match.${team}.players`, index, 1, evt.detail.player );
        this._updateScoreboard();
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

    /**
     * @param {Event} evt 
     */
    scorePlayerBtn(evt) {
    
        let ele = document.getElementById(this.idScoreDialog);
        ele.querySelector('ice-hockey-add-score').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-score').player = evt.detail;
        ele.querySelector('ice-hockey-add-score').period = this.match.getCurrentPeriod();
        ele.open();
    }

    addScore(evt) {
        let ele = document.getElementById(this.idScoreDialog);
        ele.close();
       
        var type = evt.target.typeTeam;
        let team = 'homeScores';

        if (type !== 'home') {
            let team = 'guestScores';            
        } 
        
        this.match[team].push(evt.detail.score);
        this._updateScoreboard();
    }

    /**
     * @param {*} evt 
     */
    addGenericScore(evt) {
       
        var type = evt.target.getAttribute('type');
        let team = 'homeScores';
       
        if (type !== 'home') {
            team = 'guestScores';
        } 
        
        this.match[team].push(new IceHockeyScore);
        this._updateScoreboard(type);
    }

    /**
     * @param {Event} evt 
     */
    removeScore(evt) {
 
        let type = evt.target.parentElement.getAttribute('typeTeam');
        let team = 'homeScores';
        if (type !== 'home') {
            team = 'guestScores';
        }

        this.splice(`match.${team}`, evt.target.parentElement.index, 1);     
        this._updateScoreboard(type);
    }

    /**
     * @param {string} team 
     */
    _notifyScore(team) {
  
        if (team === undefined || team === 'home') {
            this.notifyPath('match.homeScores');
            this.homePoint = this.match.getHomeScores().length;
            this.$.homeRepeatScore.render();
        }

        if (team === undefined || team === 'guest') {
            this.notifyPath('match.guestScores');
            this.guestPoint = this.match.getGuestScores().length;
            this.$.guestRepeatScore.render();
        }
    }

    /**
     */
    _updateScoreboard(type) {
        this.scoreboardService.updateMatchScoreboard(this.match)
            .then((data) => {
                this._notifyScore(type);
            }).catch((error) => {
                console.error(error);
            });
    }
}
window.customElements.define('ice-hockey-scoreboard', IceHockeyScoreboard);

