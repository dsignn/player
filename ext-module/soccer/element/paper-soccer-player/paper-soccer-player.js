(async () => {

    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { lang } = await import('./language.js');

    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-flex-layout/iron-flex-layout.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-card/paper-card.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog/paper-dialog.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-item/paper-item.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-listbox/paper-listbox.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-menu-button/paper-menu-button.js`));

    /**
     * @customElement
     * @polymer
     */
    class PaperSoccerPlayer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
                <style >
                    :host {
                        display: block;
                    }

                    paper-card {
                        @apply --layout-horizontal;
                        @apply --application-paper-card;
                        height: 60px;

                        @apply ---paper-soccer-player;
                    }
                    
                    #leftSection {
                        width: 80px;
                        background-size: cover;
                        background-position: center;
                        background-repeat: no-repeat;
                    }
                    
                    #fastAction {
                        border-right: 1px solid var(--divider-color);
                    }
                    
                    #fastAction .action {
                        height: 30px;
                        @apply --layout;
                        @apply --layout-center
                        @apply --layout-center-justified;
                    }
                    
                    #rightSection {
                        @apply --layout-horizontal;
                        @apply --layout-flex;
                    }
                            
                    #content {
                        display: flex;
                        @apply --layout-flex;
                        padding: 4px;
                        word-break: break-all;
                        overflow: hidden;
                        font-size: 20px;
                    }  
                    
                    #content .space:nth-child(2),
                    #content .space:nth-child(3) {
                        margin-left: 6px;
                    }

                    .number {
                        width:50px;
                    }
                    
                    .name {
                        overflow: hidden;
                    }
                        
                </style>
                <paper-card id="card">
                    <div id="leftSection"></div>
                    <div id="fastAction">
                        <div class="action">
                        </div>
                    </div>
                    <div id="rightSection">
                        <div id="content">
                            <div class="number">{{player.shirtNumber}}</div>
                            <div id="nane" class="name">{{player.firstName}}</div>
                            <div id="surnane" class="name">{{player.lastName}}</div>
                        </div>
                        <div id="crud">
                            <paper-icon-button id="pointTooltip" icon="soccer:disk" on-tap="_point"></paper-icon-button>
                            <paper-tooltip for="pointTooltip" position="left">{{localize('set-point')}}</paper-tooltip>
                            <paper-menu-button id="crudButton" ignore-select horizontal-align="right">
                                <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                                <paper-listbox slot="dropdown-content" multi>
                                    <paper-item on-tap="_update">{{localize('modify')}}</paper-item>
                                    <paper-item  on-tap="_delete">{{localize('delete')}}</paper-item>
                                </paper-listbox>
                            </paper-menu-button>
                        </div>
                    </div>
                </paper-card>
            `
        }
        
        constructor() {
            super();
            this.resources = lang;
        }

        static get properties () {
            return {


                /**
                 * @type FileEntity
                 */
                player: { },

                /**
                 * @type true
                 */
                autoUpdateEntity: {
                    value: true
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _localizeService: 'Localize',
                        _resourceService : "ResourceService",
                        StorageContainerAggregate: {
                            "_storage":"ResourceStorage"
                        }
                    }
                },

                direction: {
                    observer: 'changeDirection',
                    value: 'vertical'
                },

                /**
                 * @type StorageInterface
                 */
                _storage: {
                    type: Object,
                    readOnly: true
                },

                /**
                 * @type ResourceService
                 */
                _resourceService: {
                    type: Object,
                    readOnly: true
                }
            }
        }

            /**
         * @param evt
         * @private
         */
        _update(evt) {
            this.dispatchEvent(new CustomEvent('update', {detail: this.player}));
            this.$.crudButton.close();
        }
        
        /**
         * @param evt
         * @private
         */
        _delete(evt) {
            this.dispatchEvent(new CustomEvent('delete', {detail: this.player}));
            this.$.crudButton.close();
        }

        /**
         * @param evt
         * @private
         */
        _point(evt) {
            this.dispatchEvent(new CustomEvent('point', {detail: this.player}));
        }

        changeDirection(value) {

            switch(true) {
                case value === 'vertical':
                    this.$.pointTooltip.style.display = 'none';
                    break;
                case value === 'horizontal':
                    this.$.pointTooltip.style.display = 'inline-block';
                    this.$.leftSection.style.display = 'none';
                    this.$.content.style.flexDirection = 'row';
                    this.$.content.style.alignItems = 'center';
                    this.$.nane.classList.add("space");
                    this.$.surnane.classList.add("space");
                    this.$.card.style.height = '40px';
                    this.$.crudButton.style.padding= '0';
                    break;
            }
        }
    }
    window.customElements.define('paper-soccer-player', PaperSoccerPlayer);

})()



