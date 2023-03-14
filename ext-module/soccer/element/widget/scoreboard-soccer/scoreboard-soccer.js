(async () => {

    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { SoccerMatchEntity } = await import(`${container.get('Application').getAdditionalModulePath()}/soccer/src/entity/SoccerMatchEntity.js`);
    const { SoccerPlayerEntity } = await import(`${container.get('Application').getAdditionalModulePath()}/soccer/src/entity/SoccerPlayerEntity.js`);
    const { SoccerScore } = await import(`${container.get('Application').getAdditionalModulePath()}/soccer/src/entity/embedded/SoccerScore.js`);
    const { SoccerScoreboardService } = await import(`${container.get('Application').getAdditionalModulePath()}/soccer/src/SoccerScoreboardService.js`);
    const { lang } = await import(`${container.get('Application').getAdditionalModulePath()}/soccer/element/widget/scoreboard-soccer/language.js`);

    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-flex-layout/iron-flex-layout.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog/paper-dialog.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));
    await import(require('path').normalize(`${container.get('Application').getBasePath()}elements/paper-chrono/paper-chrono.js`));
    
    await import(`${container.get('Application').getAdditionalModulePath()}/soccer/element/paper-soccer-player/paper-soccer-player.js`);
    await import(`${container.get('Application').getAdditionalModulePath()}/soccer/element/soccer-add-player/soccer-add-player.js`);
    await import(`${container.get('Application').getAdditionalModulePath()}/soccer/element/soccer-add-score/soccer-add-score.js`);
    /**
     * @customElement
     * @polymer
     */
    class ScoreboardSoccer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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

                    paper-soccer-player {
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
                                <paper-icon-button id="plusPlayerHome" icon="soccer:add-user" class="circle" type="home" on-tap="addPlayerBtn"></paper-icon-button>
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
                                <paper-icon-button id="plusPlayerGuest" icon="soccer:add-user" class="circle" type="guest" on-tap="addPlayerBtn"></paper-icon-button>
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
                                <paper-soccer-player 
                                    player="{{player}}" 
                                    on-delete="deletePlayer" 
                                    on-update="updatePlayerBtn" 
                                    on-point="scorePlayerBtn"
                                    type="home"
                                    direction="horizontal">
                                </paper-soccer-player>
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
                                <paper-soccer-player 
                                    player="{{player}}" 
                                    on-delete="deletePlayer" 
                                    on-update="updatePlayerBtn" 
                                    on-point="scorePlayerBtn"
                                    type="guest"
                                    direction="horizontal">
                                </paper-soccer-player>
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
                    value: new SoccerMatchEntity(),
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
                            _storage: "SoccerMatchStorage"
                        },
                        scoreboardService: 'SoccerScoreboardService'
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

        /**
         * @return {string}
         */
        getTitle() {
            return this.localize('title');
        }

        /**
         * @return {string}
         */
        getSubTitle() {
            return '';
        }

        localizeChange(service) {
            this._injectMetadataLogos();
        }

        _injectMetadataLogos() {
            let resources = this.shadowRoot.querySelectorAll('paper-icon-resource-upsert');
            resources.forEach(element => {
                element.name = `${this.localize('score-logo')} susus${this.match.name ?  ' ' + this.match.name : ''}`;
                element.tags = [this.localize('score-tag')];
            });
        }

        connectedCallback() {
            super.connectedCallback();

            let ele = document.createElement('paper-dialog');
            this.idPlayerDialog = this.__randomString();
            ele.setAttribute('id', this.idPlayerDialog);
            ele.setAttribute('with-backdrop', '');

            let addPlayer = document.createElement('soccer-add-player');
            ele.appendChild(addPlayer);

            addPlayer.addEventListener('update', this.updatePlayer.bind(this));
            addPlayer.addEventListener('add', this.addPlayer.bind(this));
            document.body.appendChild(ele);

            ele = document.createElement('paper-dialog');
            this.idScoreDialog = this.__randomString();
            ele.setAttribute('id', this.idScoreDialog);
            ele.setAttribute('with-backdrop', '');

            let addScore = document.createElement('soccer-add-score');
            ele.appendChild(addScore);

            addScore.addEventListener('point', this.addScore.bind(this)); 
            document.body.appendChild(ele);
        }


        matchChange(newMatch, oldMatch) {
            if (!newMatch) {
                return;
            }
        
            // TODO pensaci
            newMatch.time.id = 'SoccerTime';

            if (!newMatch || !newMatch.id) {
                this.homePoint = null;
                this.guestPoint = null;
            } else {
                this.homePoint = newMatch.getHomeScores().length;
                this.guestPoint = newMatch.getGuestScores().length;
                if (oldMatch) {
                    this._syncPeriod(oldMatch);
                }
            }

            this._injectMetadataLogos();
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

            service.getEventManager().on(SoccerScoreboardService.CHANGE_SCOREBOARD_MATCH, (evt) => {
                this.match = evt.data;
            });

            service.getEventManager().on(SoccerScoreboardService.DATA, (evt) => {
                console.log('sucaaaaaaaaaaaaaaaaaaaaaaaaaaa');
                this.match = evt.data.match;
                // TODO better method to force update???
                this.matchChange(this.match);
            });

            service.getEventManager().on(SoccerScoreboardService.CLEAR_SCOREBOARD_MATCH, (evt) => {
                this.match = null;
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
            ele.querySelector('soccer-add-player').typeTeam = evt.target.getAttribute('type');
            ele.querySelector('soccer-add-player').player = evt.detail;
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
            ele.querySelector('soccer-add-player').typeTeam = evt.target.getAttribute('type');
            ele.querySelector('soccer-add-player').player = new SoccerPlayerEntity();
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
            ele.querySelector('soccer-add-score').typeTeam = evt.target.getAttribute('type');
            ele.querySelector('soccer-add-score').player = evt.detail;
            ele.querySelector('soccer-add-score').period = this.match.getCurrentPeriod();
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
            
            this.match[team].push(new SoccerScore);
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
    window.customElements.define('scoreboard-soccer', ScoreboardSoccer);
})()