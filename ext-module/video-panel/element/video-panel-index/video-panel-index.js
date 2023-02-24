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
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tabs/paper-tabs.js`));

    await import('./../video-panel-resource-view-upsert/video-panel-resource-view-upsert.js');  
    await import('./../video-panel-resource-view-list/video-panel-resource-list.js');  
    await import('./../video-panel-view-upsert/video-panel-view-upsert.js');  
    await import('./../video-panel-view-list/video-panel-view-list.js');  

    /**
     * Entry point for the module videoPanel
     *
     * @customElement
     * @polymer
     */
    class VideoPanelIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {
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
                            
                    paper-tabs {
                        margin-bottom: 8px;
                        max-width: 450px;
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
                <paper-tabs selected="{{selected}}" tabindex="0">
                    <paper-tab>{{localize('video-panel')}}</paper-tab>
                    <paper-tab>{{localize('video-panel-resource')}}</paper-tab>
                </paper-tabs>
                <iron-pages id="ironPages" selected="{{selected}}">
                    <div>
                        <iron-pages id="ironPages" selected="{{viewSelected}}">
                            <div id="list">
                                <video-panel-view-list id="viewList" selected="{{viewSelected}}" entity-selected="{{videoPanelSelected}}">
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <paper-filter-storage id="filterStorage" on-value-changed="_filterChange">
                                            <div slot="filters" class="filter-container">
                                                <paper-input name="name" label="{{localize('name')}}" ></paper-input>
                                            </div>
                                        </paper-filter-storage>
                                        <paper-icon-button id="iconBackInsert" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('insert-video-panel')}}</paper-tooltip>
                                    </div>
                                </video-panel-view-list>   
                            </div>
                            <div id="add">
                                <video-panel-view-upsert>
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <div class="layout-flex">{{localize('insert-video-panel')}}</div>
                                        <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                    </div>
                                </video-panel-view-upsert>
                            </div>
                            <div id="edit">
                                <video-panel-view-upsert entity="{{videoPanelSelected}}">
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <div class="layout-flex">{{localize('update-video-panel')}}</div>
                                        <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                    </div>
                                </video-panel-view-upsert>
                            </div>
                        </iron-pages>
                    </div>
                    <div>
                        <iron-pages id="ironPages" selected="{{viewResourceSelected}}">
                            <div id="listResource">
                                <video-panel-resource-view-list selected="{{viewResourceSelected}}" entity-selected="{{videoPanelResourceSelected}}">
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <paper-filter-storage id="filterStorage" on-value-changed="_filterChange">
                                            <div slot="filters" class="filter-container">
                                                <paper-input name="name" label="{{localize('name')}}" ></paper-input>
                                            </div>
                                        </paper-filter-storage>
                                        <paper-icon-button id="iconBackInsert" icon="insert" class="circle" on-click="displayAddViewResource"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('insert-video-panel-resource')}}</paper-tooltip>
                                    </div>
                                </video-panel-resource-view-list>       
                            </div>
                            <div id="addResource">
                                <video-panel-resource-view-upsert>
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <div class="layout-flex">{{localize('insert-video-panel-resource')}}</div>
                                        <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListViewResource"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                    </div>
                                </video-panel-resource-view-upsert>   
                            </div>
                            <div id="editResource">
                            <video-panel-resource-view-upsert  entity="{{videoPanelResourceSelected}}">
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <div class="layout-flex">{{localize('edit-video-panel-resource')}}</div>
                                        <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListViewResource"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                    </div>
                                </video-panel-resource-view-upsert>     
                            </div>
                        </iron-pages>
                    </div>
                </iron-pages>
            `;
        }

        static get properties() {
            return {

                selected: {
                    type: Number,
                    value: 1
                },

                viewSelected: {
                    type: Number,
                    value: 0
                },

                viewResourceSelected: {
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
            }
        }

        constructor() {
            super();
            this.resources = lang;
        }

        displayAddView() {
            this.viewSelected = 1;
        }

        displayListView() {
            this.viewSelected = 0;
        }

        displayAddViewResource() {
            this.viewResourceSelected = 1;
        }

        displayListViewResource() {
            this.viewResourceSelected = 0;
        }
    }
    window.customElements.define("video-panel-index", VideoPanelIndex);
})()