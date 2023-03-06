(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { SoccerMatchEntity } = await import(require('path').normalize(
        `${container.get('Application').getAdditionalModulePath()}module/soccer/src/entity/SoccerMatchEntity.js`));
         
    /**
     *
     */
    class WcResourceSoccerScoreboard extends ServiceInjectorMixin(PolymerElement) {

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
                {{scoreboard.time.hours}}:{{scoreboard.time.minutes}}:{{scoreboard.time.seconds}}
            </div>
            <div class="row">   
                <div class="column half a-c">
                    <div>{{homeScore}}</div>
                    <div class="logo" id="logoHome"></div>
                    <div>{{scoreboard.homeTeam.name}}</div>
                </div>
                <div class="column half a-c">
                    <div>{{guestScore}}</div> 
                    <div class="logo" id="logoGuest"></div>
                    <div>{{scoreboard.guestTeam.name}}</div>
                </div>
            </div>
         
        </div>
        `;
        }

        static get properties() {
            return {
                scoreboard: {
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

                services: {
                    value: {
                        _resourceService: "ResourceService"
                    }
                },
            };
        }

        static get observers() {
            return [
                'observerSoccerMatchChanged(_resourceService, scoreboard)'
            ]
        }

        ready() {
            super.ready();

            require('electron').ipcRenderer.on('data-scoreboard', this._updateTimer.bind(this))
        }

        /**
         * @param newValue
        */
        observerSoccerMatchChanged(_resourceService, scoreboard) {
            if (!_resourceService || !scoreboard) {
                return;
            }

            this.homeScore = scoreboard.homeScores.length;
            this.guestScore = scoreboard.guestScores.length;
            this.$.scoreboard.classList.remove('hidden');
            this.loadHomeLogo(scoreboard.homeTeam.logo);
            this.loadGuestLogo(scoreboard.guestTeam.logo);
        }

        /**
         * 
         * @param {*} evt 
         * @param {Object} data 
         */
        _updateTimer(evt, data) {
            this.scoreboard = data.match;
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

    window.customElements.define('wc-resource-soccer-scoreboard', WcResourceSoccerScoreboard);

})();




