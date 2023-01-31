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
  
    await import('./../paper-timeline/paper-timeline.js');  

    /**
     * @customElement
     * @polymer
     */
    class TimelineViewList extends  StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

        static get template() {
            return html`
                <style>
                    #list {
                        padding-top: var(--padding-top-view-list);
                        @apply --layout-horizontal;
                        @apply --layout-wrap;
                    }
                    
                    @media (max-width: 500px) {
                        paper-timeline {
                            flex-basis: 100%;
                        }
                    }
        
                    @media (min-width: 501px) and (max-width: 900px) {
                        paper-timeline {
                            flex-basis: 50%;
                        }
                    }
        
                    @media (min-width: 901px) and (max-width: 1200px) {
                        paper-timeline {
                            flex-basis: 33.3%;
                        }
                    }
        
                    @media (min-width: 1201px) and (max-width: 1500px) {
                        paper-timeline {
                            flex-basis: 25%;
                        }
                    }
        
                    @media (min-width: 1501px) and (max-width: 1919px) {
                        paper-timeline {
                            flex-basis: 20%;
                        }
                    }
        
                    @media (min-width: 1920px) {
                        paper-timeline {
                            flex-basis: 16.6%;
                        }
                    }
                </style>
                <slot name="header"></slot>
                <div id="list">
                    <template is="dom-repeat" items="[[entities]]" as="timeline">
                        <paper-timeline 
                            entity="{{timeline}}"
                            on-play="play"
                            on-resume="resume"
                            on-stop="stop"
                            on-pause="pause"
                            on-delete="_deleteEntity"
                            on-update="_showUpdateView"             
                            on-change-rotation="_updateEntity"
                            on-change-context="_updateEntity"   
                            on-timeupdate="_updateTime">
                        </paper-timeline>
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
                 * @type object
                 */
                services : {
                    value : {
                        _notify : "Notify",
                        _localizeService: "Localize",
                        StorageContainerAggregate: {
                            _storage: "TimelineStorage"
                        },
                        _timelineService: "TimelineService"
                    }
                },


                /**
                 * @type Notify
                 */
                _timelineService: {
                    type: Object,
                    readOnly: true
                },
            };
        }

        static get observers() {
            return [
                'observerPaginationEntities(page, itemPerPage, _storage)'
            ]
        }

        /**
         * @param evt
         */
        play(evt) {
            this._timelineService.play(evt.detail);
        }

        /**
         * @param evt
         */
        resume(evt) {
            this._timelineService.resume(evt.detail);
        }

        /**
         * @param evt
         */
        stop(evt) {
            this._timelineService.stop(evt.detail);
        }

        /**
         * @param evt
         */
        pause(evt) {
            this._timelineService.pause(evt.detail);
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
         * @param evt
         */
        _updateTime(evt) {
            this._timelineService.changeTime(evt.detail.timeline, evt.detail.time);
        }
    }
    window.customElements.define('timeline-view-list', TimelineViewList);
})()
