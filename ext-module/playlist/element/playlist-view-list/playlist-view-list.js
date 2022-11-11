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
 
    await import('./../paper-playlist/paper-playlist.js');

    /**
     * @customElement
     * @polymer
     */
    class PlaylistViewList extends  StoragePaginationMixin(StorageCrudMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))) {

        static get template() {
            return html`
                <style>
                    #list {
                        padding-top: var(--padding-top-view-list);
                        @apply --layout-horizontal;
                        @apply --layout-wrap;
                    }
                    
                    @media (max-width: 500px) {
                        paper-playlist {
                            flex-basis: 100%;
                        }
                    }
        
                    @media (min-width: 501px) and (max-width: 900px) {
                        paper-playlist {
                            flex-basis: 50%;
                        }
                    }
        
                    @media (min-width: 901px) and (max-width: 1200px) {
                        paper-playlist {
                            flex-basis: 33.3%;
                        }
                    }
        
                    @media (min-width: 1201px) and (max-width: 1500px) {
                        paper-playlist {
                            flex-basis: 25%;
                        }
                    }
        
                    @media (min-width: 1501px) and (max-width: 1919px) {
                        paper-playlist {
                            flex-basis: 20%;
                        }
                    }
        
                    @media (min-width: 1920px) {
                        paper-playlist {
                            flex-basis: 16.6%;
                        }
                    }
                </style>
                <slot name="header"></slot>
                <div id="list">
                    <template is="dom-repeat" items="[[entities]]" as="playlist">
                        <paper-playlist entity="{{playlist}}" 
                            on-play="play"
                            on-resume="resume"
                            on-stop="stop"
                            on-pause="pause"
                            on-delete="_deleteEntity" 
                            on-update="_showUpdateView"
                            on-change-rotation="_updateEntity"
                            on-change-context="_updateEntity"
                            on-timeupdate="_updateTime">
                        </paper-playlist>
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
                        _playlistService : "PlaylistService",
                        StorageContainerAggregate: {
                            _storage: "PlaylistStorage"
                        }
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
            this._playlistService.play(evt.detail);
        }

        /**
         * @param evt
         */
        resume(evt) {
            console.log('resume');
            this._playlistService.resume(evt.detail);
        }

        /**
         * @param evt
         */
        stop(evt) {
            console.log('stop');
            this._playlistService.stop(evt.detail);
        }

        /**
         * @param evt
         */
        pause(evt) {
            console.log('pause');
            this._playlistService.pause(evt.detail);
        }

        /**
         * @param {CustomEvent} evt
         * @private
         */
        _updateTime(evt) {
            this._playlistService.changeTime(evt.detail.playlist, evt.detail.time);
        }
    }
    window.customElements.define('playlist-view-list', PlaylistViewList);
})()