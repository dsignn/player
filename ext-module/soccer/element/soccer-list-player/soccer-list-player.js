(async () => {

    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { lang } = await import('./language.js');
   
    /**
     * @customElement
     * @polymer
     */
    class SoccerListPlayer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
                <style>
                
                </style>
                <dom-repeat id="menu" items="{{languages}}" as="language">
                    <template>
                        <paper-item value="{{language}}">{{localize(language)}}</paper-item>
                    </template>
                </dom-repeat>
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
                players: {
                    type: Array,
                    notify: true,
                    value: []
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _notify : "Notify",
                        _localizeService: 'Localize',
                        "StorageContainerAggregate": {
                            _storage: "SoccerMatchStorage"
                        }
                    }
                }
            };
        }
    }
    window.customElements.define('soccer-list-player', SoccerListPlayer);
})()