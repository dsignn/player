(async () => {

 
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { lang } = await import('./language.js');
    const { IceHockeyScore } = await import('./../../src/entity/embedded/IceHockeyScore.js');

    /**
     * @customElement
     * @polymer
     */
    class IceHockeyAddScore extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
                <style>
                    #list {
                        padding-top: var(--padding-top-view-list);
                        @apply --layout-horizontal;
                        @apply --layout-wrap;
                    }

                    paper-card {
                        padding: 20px 0;
                    }
                </style>
                <paper-card elevation="0">
                    <div>{{localize('point')}}</div>
                    <paper-input label="{{localize('time')}}" value="{{score.time}}"></paper-input>
                    <paper-input label="{{localize('period')}}" value="{{period.name}}" disabled></paper-input>
                    <paper-input label="{{localize('player')}}" value="{{player.firstName}} {{player.lastName}}" disabled></paper-input>
                    <div><paper-button on-tap="submit">{{localize(stringBtn)}}</paper-button><div>
                </paper-card>
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
                score: {
                    notify: true,
                    value: new IceHockeyScore(),
                },

                period: {

                },

                player: {

                },

                /**
                 * @type MonitorEntity
                 */
                typeTeam: {
                    type: String,
                    notify: true,
                    value: 'test'
                },

                stringBtn: {
                    type: String,
                    notify: true,
                    value: 'add'
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

        /**
         * @param {Event} evt 
         */
        submit(evt) {
            this.score.playerReference.collection = 'player';
            this.score.playerReference.id = this.player.id;
            this.score.period = this.period;

            this.dispatchEvent(new CustomEvent('point', {detail: {score: this.score, team: this.typeTeam}}));

            this.score = new IceHockeyScore();
        }
    }

    window.customElements.define('ice-hockey-add-score', IceHockeyAddScore);
})()