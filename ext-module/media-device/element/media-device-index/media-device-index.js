(async () => {   
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { lang } = await import('./language.js');
    const { flexStyle } = await import(`${container.get('Application').getBasePath()}style/layout-style.js`);
    

    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-pages/iron-pages.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-icon-button/paper-icon-button.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tooltip/paper-tooltip.js`));

    await import('./../media-device-view-list/media-device-view-list.js')
    await import('./../media-device-view-upsert/media-device-view-upsert.js')

    /**
     * Entry point for the module mediaDevice
     *
     * @customElement
     * @polymer
     */
    class MediaDeviceIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
                ${flexStyle} 
                <style>
                    div.header {
                        @apply --header-view-list;
                    }
                            
                    paper-icon-button.circle {
                        @apply --paper-icon-button-action;
                    }
                </style>
                <iron-pages id="ironPages" selected="{{selected}}">
                    <div id="list">
                        <media-device-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                            <div slot="header" class="layout-horizontal layout-center-aligned header">
                                <div class="layout-flex">{{localize('list-media-device')}}</div>
                                <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-media-device')}}</paper-tooltip>
                            </div>
                        </media-device-view-list>
                    </div>
                    <div id="add">
                        <media-device-view-upsert>
                            <div slot="header" class="layout-horizontal layout-center-aligned header">
                                <div class="layout-flex">{{localize('insert-media-device')}}</div>
                                <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                            </div>
                        </media-device-view-upsert>
                    </div>
                    <div id="update">
                        <media-device-view-upsert entity="{{entitySelected}}">
                            <div slot="header" class="layout-horizontal layout-center-aligned header">
                                <div class="layout-flex">{{localize('update-media-device')}}</div>
                                <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                            </div>
                        </media-device-view-upsert>               
                    </div>
                </iron-pages> 
            `;
        }

        static get properties () {
            return {

                /**
                 * @type number
                 */
                selected: {
                    type: Number,
                    value: 0
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _localizeService: 'Localize'
                    }
                }
            };
        }

        constructor() {
            super();
            this.resources = lang;
        }

        /**
         * @param evt
         */
        displayAddView(evt) {
            this.selected = 1;
        }

        /**
         * @param evt
         */
        displayListView(evt) {
            this.selected = 0;
        }
    }
    window.customElements.define("media-device-index", MediaDeviceIndex);
})()
