(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { IceHockeyScoreboardService } =  await import('./../../src/IceHockeyScoreboardService.js');
    const { lang } = await import('./language.js');
    const { flexStyle } = await import(`${container.get('Application').getBasePath()}style/layout-style.js`);
    
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/iron-pages/iron-pages.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-icon-button/paper-icon-button.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@polymer/paper-tabs/paper-tabs.js`));

    await import('./../ice-hockey-view-list/ice-hockey-view-list.js');
    await import('./../ice-hockey-view-upsert/ice-hockey-view-upsert.js');
    await import('./../ice-hockey-scoreboard/ice-hockey-scoreboard.js');
    
    /**
     * @customElement
     * @polymer
     */
    class IceHockeyIndex extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

        static get template() {
            return html`
               ${flexStyle}
                <style>
                    div.header {
                        @apply --header-view-list;
                    }
                    
                    paper-tabs {
                        margin-bottom: 8px;
                        max-width: 250px;
                    }
                
                    paper-icon-button.circle {
                        @apply --paper-icon-button-action;
                    }
                    
                    .topology {
                        position: relative;
                    }
                    
                    paper-autocomplete {
                        --autocomplete-wrapper: {
                            position: absolute;
                            min-width:250px;
                        }
                    }

                    ice-hockey-scoreboard {
                        display:none;
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
                <paper-tabs selected="{{selectedTab}}" tabindex="0">
                    <paper-tab>{{localize('general')}}</paper-tab>
                    <paper-tab>{{localize('scoreboard')}}</paper-tab>
                </paper-tabs>
                <iron-pages id="ironPages" selected="{{selectedTab}}">
                    <div> 
                        <iron-pages id="index" selected="{{selected}}">
                            <div id="list"> 
                                <ice-hockey-view-list id="viewList" selected="{{selected}}" entity-selected="{{entitySelected}}">
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <paper-filter-storage id="filterStorage" on-value-changed="_filterChange">
                                            <div slot="filters" class="filter-container">
                                                <paper-input name="name" label="{{localize('name')}}" ></paper-input>
                                            </div>
                                        </paper-filter-storage>
                                        <paper-icon-button id="iconBackInsert" icon="insert" class="circle" on-click="displayAddView"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('insert-ice-hockey-match')}}</paper-tooltip>
                                    </div>
                                </ice-hockey-view-list>
                            </div>
                            <div id="insert"> 
                                <ice-hockey-view-upsert>
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <div class="layout-flex">{{localize('insert-ice-hockey-match')}}</div>
                                        <paper-icon-button id="iconBackInsert" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                        <paper-tooltip for="iconBackInsert" position="left">{{localize('back')}}</paper-tooltip>
                                    </div>
                                </ice-hockey-view-upsert>
                            </div>
                            <div id="update"> 
                                <ice-hockey-view-upsert entity="{{entitySelected}}">
                                    <div slot="header" class="layout-horizontal layout-center-aligned header">
                                        <div class="layout-flex">{{localize('update-ice-hockey-match')}}</div>
                                        <paper-icon-button id="iconBackUpdate" icon="arrow-back" class="circle" on-click="displayListView"></paper-icon-button>
                                        <paper-tooltip for="iconBackUpdate" position="left">{{localize('back')}}</paper-tooltip>
                                    </div>
                                </ice-hockey-view-upsert>
                            </div>
                        </iron-pages>          
                    </div>
                    <div>
                        <paper-autocomplete
                            id="defaultTimeslot"
                            label="{{localize('choose-match')}}"
                            text-property="name"
                            value-property="name"
                            remote-source
                            on-autocomplete-change="_searchChanged"
                            on-autocomplete-selected="_selectMatch">
                                <template slot="autocomplete-custom-template">
                                    <style>
                                        :host {
                                            display: block;
                                        }

                                        paper-item {
                                            padding: 0 2px;
                                        }

                                    </style>
                                    <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                                        <div index="[[index]]">
                                            <div class="service-name">[[item.name]]</div>
                                        </div>
                                    </paper-item>
                                </template>
                                <paper-icon-button slot="suffix" on-tap="clearInput" icon="clear" alt="clear" title="clear"></paper-icon-button>
                        </paper-autocomplete>
                        <ice-hockey-scoreboard></ice-hockey-scoreboard>  
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
                selectedTab: {
                    type: Number,
                    value: 0
                },

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
                        _localizeService: 'Localize',
                        StorageContainerAggregate: {
                            _iceHockeyMatchStorage: "IceHockeyMatchStorage"
                        },
                        scoreboardService: 'IceHockeyScoreboardService'
                    }
                },

                scoreboardService: {
                    readOnly: true,
                    observer: 'scoreboardServiceChange'
                }
            };
        }

        scoreboardServiceChange(service) {
            if (!service) {
                return;
            }

            service.getEventManager().on(IceHockeyScoreboardService.CLEAR_SCOREBOARD_MATCH, (evt) => {
                let ele = this.shadowRoot.querySelector('ice-hockey-scoreboard');
                ele.style.display = 'none';
            });
        }

        /**
         * @param evt
         */
        clearInput(evt) {
            this.scoreboardService.clearMatch();
            this.$.defaultTimeslot.clear();
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

        /**
         * @param {Event} evt
         * @private
         */
        _searchChanged(evt) {
            if (!evt.detail.value) {
                return;
            }

            this._iceHockeyMatchStorage
                .getAll({name: evt.detail.value.text})
                .then(
                    (data) => {
                        evt.detail.target.suggestions(data);
                    }
                );
        }

        /**
         * @param {Event} evt
         * @private
         */
        _selectMatch(evt) {
            this.scoreboardService.setMatch(evt.detail.value);
            let ele = this.shadowRoot.querySelector('ice-hockey-scoreboard');
            if (evt.detail.value.getId()) {
                ele.style.display = 'block';
            } else {
                ele.style.display = 'none';
            }
        }
    }

    window.customElements.define('ice-hockey-index', IceHockeyIndex);
})()