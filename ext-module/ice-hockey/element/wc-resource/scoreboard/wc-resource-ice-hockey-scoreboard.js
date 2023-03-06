(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { IceHockeyMatchEntity } = await import(require('path').normalize(
        `${container.get('Application').getAdditionalModulePath()}/ice-hockey/src/entity/IceHockeyMatchEntity.js`));

         
    /**
     *
     */
    class WcResourceIceHockeyScoreboard extends ServiceInjectorMixin(PolymerElement) {

        static get template() {
            return html`
        <style>

            :host {
                display: block;
                height: 100%;
            }

            .row {
                display: flex;
                flex-direction: row;
            }

            .column {
                display: flex;
                flex-direction: column;
            }

            .half {
                width: 50%;
            }

            .a-c {
                align-items: center;
            }

            .j-c {
                justify-content: center;
            }

            .match {
                padding: 0;
                height: 100%;
                width: 100%;
                color: white;
                font-size: 100px;
            }

            .hidden {
                display: none;
            }

            .logo {
                height: 200px;
                width: 200px;
                background-position: center center;
                background-repeat: no-repeat;
                background-size: contain;
            }

        </style>
        <div id="scoreboard" class="match hidden">
            <div class="row j-c">
                {{scoreboardIceHockey.time.hours}}:{{scoreboardIceHockey.time.minutes}}:{{scoreboardIceHockey.time.seconds}}
            </div>
            <div class="row">   
                <div class="column half a-c">
                    <div>{{homeScore}}</div>
                    <div class="logo" id="logoHome"></div>
                    <div>{{scoreboardIceHockey.homeTeam.name}}</div>
                </div>
                <div class="column half a-c">
                    <div>{{guestScore}}</div> 
                    <div class="logo" id="logoGuest"></div>
                    <div>{{scoreboardIceHockey.guestTeam.name}}</div>
                </div>
            </div>
         
        </div>
        `;
        }

        static get properties() {
            return {
                scoreboardIceHockey: {
                    type: Object,
                    notify: true,
                    value: new IceHockeyMatchEntity()
                },

                homeScore: {
                    type: Number,
                    notify: true,
                },

                guestScore: {
                    type: Number,
                    notify: true,
                },

                services: {
                    value: {
                        _resourceService: "ResourceService"
                    }
                },
            };
        }

        static get observers() {
            return [
                'observerIceHockeyMatchChanged(_resourceService, scoreboardIceHockey)'
            ]
        }

        ready() {
            super.ready();

            require('electron').ipcRenderer.on('data-ice-hockey-scoreboard', this._updateTimer.bind(this))
        }

        /**
         * @param newValue
        */
        observerIceHockeyMatchChanged(_resourceService, scoreboardIceHockey) {
            if (!_resourceService || !scoreboardIceHockey) {
                return;
            }

            this.homeScore = scoreboardIceHockey.homeScores.length;
            this.guestScore = scoreboardIceHockey.guestScores.length;
            this.$.scoreboard.classList.remove('hidden');
            this.loadHomeLogo(scoreboardIceHockey.homeTeam.logo);
            this.loadGuestLogo(scoreboardIceHockey.guestTeam.logo);
        }

        /**
         * 
         * @param {*} evt 
         * @param {Object} data 
         */
        _updateTimer(evt, data) {
            this.scoreboardIceHockey = data.match;
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
         *
         */
        createMockData() { }
    }

    window.customElements.define('wc-resource-ice-hockey-scoreboard', WcResourceIceHockeyScoreboard);

})();




