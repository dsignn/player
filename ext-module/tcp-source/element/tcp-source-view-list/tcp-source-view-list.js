(async () => {    
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { LocalizeMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/localize/localize-mixin.js`));
    const { StorageCrudMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/storage/crud-mixin.js`));    
    const { StoragePaginationMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/storage/pagination-mixin.js`));
    const { lang } = await import('./language.js');
   
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-pagination/paper-pagination.js`));
    await import(require('path').normalize(`${container.get('Application').getNodeModulePath()}/@fluidnext-polymer/paper-pagination/icons/paper-pagination-icons.js`));
 
    await import('./../paper-tcp-source/paper-tcp-source.js');

    /**
     * @customElement
     * @polymer
     */
    class TcpSourceViewList extends  StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

        static get template() {
            return html`
                <style>
                    #list {
                        padding-top: var(--padding-top-view-list);
                        @apply --layout-horizontal;
                        @apply --layout-wrap;
                    }

                    #empty {
                        display: block;
                        padding: 16px 0;
                        font-size: 20px;
                    }
                    
                    @media (max-width: 500px) {
                        paper-tcp-source {
                            flex-basis: 100%;
                        }
                    }
        
                    @media (min-width: 501px) and (max-width: 900px) {
                        paper-tcp-source {
                            flex-basis: 50%;
                        }
                    }
        
                    @media (min-width: 901px) and (max-width: 1200px) {
                        paper-tcp-source {
                            flex-basis: 33.3%;
                        }
                    }
        
                    @media (min-width: 1201px) and (max-width: 1500px) {
                        paper-tcp-source {
                            flex-basis: 25%;
                        }
                    }
        
                    @media (min-width: 1501px) and (max-width: 1919px) {
                        paper-tcp-source {
                            flex-basis: 20%;
                        }
                    }
        
                    @media (min-width: 1920px) {
                        paper-tcp-source {
                            flex-basis: 16.6%;
                        }
                    }
                </style>
                <slot name="header"></slot>
                <div id="empty">{{localize('empty-tcp-source')}}</div>
                <div id="list">
                    <template is="dom-repeat" items="[[entities]]" as="tcpEntity">
                       <paper-tcp-source entity="{{tcpEntity}}" 
                          on-delete="_deleteEntity" 
                          on-update="_showUpdateView"
                          on-play="play"
                          on-stop="stop">
                       </paper-tcp-source>
                    </template>
                </div>
                <paper-pagination page="{{page}}" total-items="{{totalItems}}" item-per-page="{{itemPerPage}}" next-icon="next" previous-icon="previous"></paper-pagination>
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
                    notify: true,
                    value: 0
                },

                /**
                 * @type boolean
                 */
                entitySelected: {
                    notify: true
                },

                /**
                 * @type Array
                 */
                entities: {
                    notify: true,
                    observer: "_changedEntities"
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _notify : "Notify",
                        _localizeService: "Localize",
                        StorageContainerAggregate: {
                            _storage: "TcpSourceStorage"
                        },
                        _tcpSourceService: "TcpSourceService"
                    }
                },
            };
        }

        static get observers() {
            return [
                'observerPaginationEntities(page, itemPerPage, _storage)'
            ]
        }

        /**
         * @param {CustomEvent} evt
         * @private
         */
        _showUpdateView(evt) {
            this.entitySelected = evt.detail;
            this.selected = 2;
        }

        /**
         * @private
         */
        _deleteCallback() {
            this._notify.notify(this.localize('notify-delete'));
        }

        /**
         * @param evt
         */
        play(evt) {
            console.log('play');
            this._tcpSourceService.play(evt.detail);
        }

        /**
         * @param evt
         */
        stop(evt) {
            console.log('stop');
            this._tcpSourceService.stop(evt.detail);
        }

        /**
         * @private
         */
        _updateList() {
            if (Array.isArray(this.entities) && this.entities.length == 0) {
                this.$.empty.style.display = 'block';
            } else {
                this.$.empty.style.display = 'none';
            }
        }

        /**
         * @param {Array} entities 
         */
        _changedEntities(entities) {
            this._updateList();
        }
    }
    window.customElements.define('tcp-source-view-list', TcpSourceViewList);
})()