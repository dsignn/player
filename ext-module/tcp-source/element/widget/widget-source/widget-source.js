(async () => {

    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { lang } = await import(`${container.get('Application').getAdditionalModulePath()}/tcp-source/element/widget/widget-source/language.js`);

    /*
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
   */
    /**
     * @customElement
     * @polymer
     */
    class WidgetSource extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
                <style >
               

                </style>
                <div class="column j-between">
                   test
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
    }
    window.customElements.define('widget-source', WidgetSource);
})()