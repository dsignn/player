
(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { flexStyle } = await import(`${container.get('Application').getBasePath()}style/layout-style.js`);
    const { lang } = await import('./language.js');

    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-pages/iron-pages.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-icon-button/paper-icon-button.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tabs/paper-tabs.js`));

    await import('./../tcp-source-view-list/tcp-source-view-list.js');
    await import('./../tcp-source-view-upsert/tcp-source-view-upsert.js');  

    /**
     * @customElement
     * @polymer
     */
    class TcpSourceIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

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

                paper-filter-storage {
                    flex: 1;
                    --paper-filter-storage : {
                        padding: 0 8px;
                        align-items: center;
                        display: flex;
                        min-height: 70px;
                        width: -webkit-fill-available;
                        margin-right: 8px;

                    }
                }
            </style>
                
            <iron-pages id="index" selected="{{selected}}">
                <div id="list"> 
                    <tcp-source-view-list id="viewList" selected="{{selected}}" entity-selected="{{entitySelected}}">
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <paper-filter-storage id="filterStorage" on-value-changed="_filterChange">
                                <div slot="filters" class="filter-container">
                                    <paper-input name="name" label="{{localize('name')}}" ></paper-input>
                                </div>
                            </paper-filter-storage>
                            <paper-icon-button id="iconBackInsert" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                            <paper-tooltip for="iconBackInsert" position="left">{{localize('insert-tcp-source')}}</paper-tooltip>
                        </div>
                    </tcp-source-view-list>
                </div>
                <div id="insert"> 
                    <tcp-source-view-upsert>
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('insert-tcp-source')}}</div>
                            <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                            <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                        </div>
                    </tcp-source-view-upsert>
                </div>
                <div id="update"> 
                    <tcp-source-view-upsert entity="{{entitySelected}}">
                        <div slot="header" class="layout-horizontal layout-center-aligned header">
                            <div class="layout-flex">{{localize('update-tcp-source')}}</div>
                            <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                            <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                        </div>
                    </tcp-source-view-upsert>
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
                 * @type object
                 */
                services : {
                    value : {
                        _localizeService: 'Localize'
                    }
                }
            };
        }
        
        _filterChange(evt) {
            this.$.viewList.filter = JSON.parse(JSON.stringify(evt.detail));
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

    window.customElements.define('tcp-source-index', TcpSourceIndex);
})()