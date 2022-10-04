(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { MongoIdGenerator } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/util/MongoIdGenerator.js`));
    const { IceHockeyPlayerEntity } = await import('./../../src/entity/IceHockeyPlayerEntity.js');
    const { lang } = await import('./language.js');
    
    /**
     * @customElement
     * @polymer
     */
    class IceHockeyAddPlayer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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
                    <div>{{localize('player')}}</div>
                    <paper-input label="{{localize('firstName')}}" value="{{player.firstName}}"></paper-input>
                    <paper-input label="{{localize('lastName')}}" value="{{player.lastName}}"></paper-input>
                    <paper-input label="{{localize('role')}}" value="{{player.role}}"></paper-input>
                    <paper-input label="{{localize('shirtNumber')}}" value="{{player.shirtNumber}}"></paper-input>
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
                player: {
                    notify: true,
                    value: new IceHockeyPlayerEntity(),
                    observer: 'playerChange'
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
         * @param {object} value 
         */
        playerChange(value) {
            if (value.id) {
                this.stringBtn = 'update';
            } else {
                this.stringBtn = 'add';
            }
        }
        
        /**
         * 
         * @param {Event} evt 
         */
        submit(evt) {
            let event = 'add'
            if (this.player.id) {
                event = 'update'
            } else {
                this.player.setId(MongoIdGenerator.statcGenerateId());
            }

            this.dispatchEvent(new CustomEvent(event, {detail: {player: this._clonePlayer(this.player), team: this.typeTeam}}));

            if (!event != 'update') {
                this.player = new IceHockeyPlayerEntity();
            }
        }

        /**
         * 
         * @param {IceHockeyPlayerEntity} player 
         * @returns {IceHockeyPlayerEntity}
         */
        _clonePlayer(player) {
            let clone = new IceHockeyPlayerEntity();
            clone.id = player.id;
            clone.firstName = player.firstName;
            clone.lastName = player.lastName;
            clone.role = player.role;
            clone.shirtNumber = player.shirtNumber;

            return clone;
        }
    }

    window.customElements.define('ice-hockey-add-player', IceHockeyAddPlayer);
})()


