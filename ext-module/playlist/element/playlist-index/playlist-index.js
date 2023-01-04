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
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tabs/paper-tabs.js`));
   
    await import('./../playlist-view-list/playlist-view-list.js');
    await import('./../playlist-view-upsert/playlist-view-upsert.js');  

    /**
     * @customElement
     * @polymer
     */
    class PlaylistIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
                ${flexStyle} 
                <style>
                    div.header {
                        @apply --header-view-list;
                    }
                    
                    paper-tabs {
                        margin-bottom: 8px;
                        max-width: 450px;
                    }
                
                    paper-icon-button.circle {
                        @apply --paper-icon-button-action;
                    }
                    
                    .topology {
                        position: relative;
                    }
                </style>
                    <iron-pages id="index" selected="{{selected}}">
                        <div id="list"> 
                            <playlist-view-list selected="{{selected}}" entity-selected="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('list-playlist')}}</div>
                                    <paper-icon-button id="iconInsertMonitor" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                    <paper-tooltip for="iconInsertMonitor" position="left">{{localize('insert-playlist')}}</paper-tooltip>
                                </div>
                            </playlist-view-list>
                        </div>
                        <div id="insert"> 
                            <playlist-view-upsert>
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('insert-playlist')}}</div>
                                    <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </playlist-view-upsert>
                        </div>
                        <div id="update"> 
                            <playlist-view-upsert entity="{{entitySelected}}">
                                <div slot="header" class="layout-horizontal layout-center-aligned header">
                                    <div class="layout-flex">{{localize('update-playlist')}}</div>
                                    <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                    <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                                </div>
                            </playlist-view-upsert>
                        </div>
                    </iron-pages>          
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
    window.customElements.define('playlist-index', PlaylistIndex);
})()