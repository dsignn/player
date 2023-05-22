(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { SoccerMatchEntity } = await import(require('path').normalize(
        `${container.get('Application').getAdditionalModulePath()}/soccer/src/entity/SoccerMatchEntity.js`));
         
    /**
     *
     */
    class WcSoccerScoreboard extends ServiceInjectorMixin(PolymerElement) {

        static get template() {
            return html`
        <style>

            :host {
                display: block;
                height: 100%;
                --color-wc: #FFFFFF;
                font-family: roboto;
                color:var(--color-wc);
            }
        
            #scoreboard {
                display: flex;
                flex-direction: row;
                height: 100%;
            }

            #homeContainer {
                flex-basis: 20%;
            }

            #data {
                flex: 1;
            }

            #guestContainer {
                flex-basis: 20%;
            }

            #header {
                display: flex;
                height: 33%;
                margin-left: 50px;
                margin-right: 50px;
                align-items: center;
                justify-content: center;
            }

            .teamContainer {
                width: 100%;
                display: flex;
                flex-direction: row;
                font-size: 16em;
            }

            .score {
                height: 100%;
                flex-basis: 35%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .logo {
                height: 100%;
                flex-basis: 65%;
                background-position: center center;
                background-size: contain;
                background-repeat: no-repeat;
            }


            .divider {
                width: 60px; 
                height: 100%;
                display: flex;
                align-items: center;
            }

            .line {
                width: 48%;
                height: 70%;
                border-right: 3px solid var(--color-wc);
            }

            #metdata {
                margin-top: 50px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
            }

            #time {
                font-family: digital;
                font-size: 8em;
                font-weight: 500;
                display: flex;
            }

            .number {
                width: 130px;
                text-align:center;
            }

            .timeDivider {
                line-height: 60px;
            }

            .player {
                padding: 10px;
                font-size: 2.5em;
                font-weight: 500;
                display: flex;
                flex-direction: row;
                color: var(--color-wc);
            }

            .player .number {
                width: 50px;
                font-weight: 600;
            }

            .tx-l {
                text-align: left;
            }

            .tx-r {
                text-align: right;
            }

            .jc-l {
                justify-content: left;
            }

            .jc-r {
                justify-content: right;
            }

            .coach {
                height: 100%;
            }

            @media (min-width: 1280px) and (max-width: 1480px) {

                .player {
                    font-size: 1.6em;
                }
            }

            @media (min-width: 600px) and (max-width: 1271px) {

                #homeContainer, #guestContainer {
                    display: none;
                }
            }
        </style>
        <div id="scoreboard">
            <div id="homeContainer">
                <template is="dom-repeat"  items="{{scoreboardSoccer.homeTeam.players}}" as="player">
                    <div class="player jc-l">
                        <div class="number tx-l">{{player.shirtNumber}}</div>
                        <div class="name">{{player.lastName}} {{player.firstName}}</div>
                    </div>
                </template>
            </div>
            <div id="data">
                <div id="header">
                    <div class="teamContainer">
                        <div class="logo" id="logoHome">&nbsp</div>
                        <div id="homeScore" class="score">{{homeScore}}</div>
                    </div>
                    <div class="divider">
                        <div class="line"></div>
                    </div>
                    <div class="teamContainer">
                        <div id="guestScore" class="score">{{guestScore}}</div>
                        <div class="logo" id="logoGuest">&nbsp</div>
                    </div>
                </div>
                <div id="metdata">
                    <div id="time">
                        <div class="number">{{_getStringTime(scoreboardSoccer.time.minutes)}}</div>
                        <div class="timeDivider">:</div>
                        <div class="number">{{_getStringTime(scoreboardSoccer.time.seconds)}}</div>
                    </div>
                </div>
            </div>
            <div id="guestContainer">
                <template is="dom-repeat"  items="{{scoreboardSoccer.guestTeam.players}}" as="player">
                    <div class="player jc-r">
                        <div class="name">{{player.lastName}} {{player.firstName}}</div>
                        <div class="number tx-r">{{player.shirtNumber}}</div>
                    </div>
                </template>
            </div>
        </div>
        `;
        }

        static get properties() {
            return {
                scoreboardSoccer: {
                    type: Object,
                    notify: true,
                    value: new SoccerMatchEntity()
                },

                homeScore: {
                    type: Number,
                    notify: true,
                },

                guestScore: {
                    type: Number,
                    notify: true,
                },

                resource: {

                },

                services: {
                    value: {
                        _resourceService: "ResourceService",
                        _application: "Application"
                    }
                },
            };
        }

        static get observers() {
            return [
                'observerSoccerMatchChanged(_resourceService, scoreboardSoccer)',
                'observerApplicationChanged(_application, resource)',
            ]
        }

        ready() {
            super.ready();

            require('electron').ipcRenderer.on('data-soccer-scoreboard', this._updateTimer.bind(this));
            require('electron').ipcRenderer.on('change-soccer-scoreboard-match', this._updateTimer.bind(this));
        }

        _getResourcePath() {
            return `${this._application.getResourcePath()}/${this.resource.id}`;
        }

        /**
         * @param newValue
        */
        observerSoccerMatchChanged(_resourceService, scoreboardSoccer) {
            if (!_resourceService || !scoreboardSoccer) {
                return;
            }

            this.homeScore = scoreboardSoccer.homeScores.length;
            this.guestScore = scoreboardSoccer.guestScores.length;
            this.$.scoreboard.classList.remove('hidden');
            this.loadHomeLogo(scoreboardSoccer.homeTeam.logo);
            this.loadGuestLogo(scoreboardSoccer.guestTeam.logo);
        }

        observerApplicationChanged(_application, resource) {
            if (!_application || !resource) {
                return
            }

            let digital = new FontFace('digital',  `url(${ this._getResourcePath()}/digital-7.ttf)`);
            digital.load().then(function(loaded_face) {
                document.fonts.add(loaded_face);
              
            }).catch(function(error) {
                console.error(error);
            });

            let roboto = new FontFace('roboto',  `url(${ this._getResourcePath()}/Roboto-Regular.ttf)`);
            roboto.load().then(function(loaded_face) {
                document.fonts.add(loaded_face);
              
            }).catch(function(error) {
                console.error(error);
            });
        }

        /**
         * 
         * @param {*} evt 
         * @param {Object} data 
         */
        _updateTimer(evt, data) {
            this.scoreboardSoccer = data;
        }

        loadHomeLogo(resource) {
            let logo = this._resourceService.getResourcePath(resource);
            this.$.logoHome.style.backgroundImage = `url("${logo}")`;
        }

        loadGuestLogo(resource) {
            let logo = this._resourceService.getResourcePath(resource);
            this.$.logoGuest.style.backgroundImage = `url("${logo}")`;
        }

        /**
         * @param {number} time 
         * @returns 
         */
        _getStringTime(time) {
            if(time < 10) {
                time = '0' + time
            }

            return time;
        }

        /**
         *
         */
        createMockData() { }
    }

    window.customElements.define('wc-soccer-scoreboard', WcSoccerScoreboard);

})();


