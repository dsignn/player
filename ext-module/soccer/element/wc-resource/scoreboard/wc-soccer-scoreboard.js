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
    class WcResourceSoccerScoreboard extends ServiceInjectorMixin(PolymerElement) {

        static get template() {
            return html`
        <style>

            :host {
                display: block;
                height: 100%;
                font-family: 'sans-serif';
            }

            .h-100 {
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

            .f-size-100 {
                font-size:100px;
            }

            .f-size-210 {
                font-size: 210px;
            }

            .a-c {
                align-items: center;
            }

            .j-c {
                justify-content: center;
            }

            .j-e {
                justify-content: end;
            }

            .match {
                padding: 0;
                height: 100%;
                width: 100%;
                color: white;
                
            }

            .hidden {
                display: none;
            }

            .logo {
                height: 300px;
                width: 300px;
                background-position: center center;
                background-repeat: no-repeat;
                background-size: contain;
            }

        </style>
        <div id="scoreboard" class="match hidden">
          
            <div class="row j-c f-size-100 a-c">{{scoreboardSoccer.time.hours}}:{{scoreboardSoccer.time.minutes}}:{{scoreboardSoccer.time.seconds}}</div> 
            <div class="row h-100">  
                <div class="row half a-c j-e">
                    <div class="logo" id="logoHome"></div>
                    <div class="f-size-210">{{homeScore}}</div>
                    <!--<div>{{scoreboardSoccer.homeTeam.name}}</div>-->
                </div>
                <div style="font-size: 210px" class="row a-c">-</div>
                <div class="row half a-c">
                    <div class="f-size-210">{{guestScore}}</div> 
                    <div class="logo" id="logoGuest"></div>
                    <!--<div>{{scoreboardSoccer.guestTeam.name}}</div>-->
                </div>

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

                services: {
                    value: {
                        _resourceService: "ResourceService"
                    }
                },
            };
        }

        static get observers() {
            return [
                'observerSoccerMatchChanged(_resourceService, scoreboardSoccer)'
            ]
        }

        ready() {
            super.ready();

            require('electron').ipcRenderer.on('data-soccer-scoreboard', this._updateTimer.bind(this))
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

        /**
         * 
         * @param {*} evt 
         * @param {Object} data 
         */
        _updateTimer(evt, data) {
            this.scoreboardSoccer = data.match;
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

    window.customElements.define('wc-soccer-scoreboard', WcResourceSoccerScoreboard);

})();