import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageEntityMixin} from "@dsign/polymer-mixin/storage/entity-mixin";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PaperIceHockeyPlayer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style >
                :host {
                    display: block;
                    background: red;
                }

                paper-card {
                    @apply --layout-horizontal;
                    @apply --application-paper-card;
                    height: 60px;
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
                    height: 20px;
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
                        <paper-menu-button id="crudButton" ignore-select horizontal-align="right">
                            <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                            <paper-listbox slot="dropdown-content" multi>
                                <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                            </paper-listbox>
                        </paper-menu-button>
                    </div>
                </div>
            </paper-card>
        `
    }
    PaperIceHockeyPlayer
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
                value: 'horizontal'
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

    changeDirection(value) {

        if (value === 'vertical') {
            leftSection
        }
        switch(true) {
            case value === 'vertical':
                break;
            case value === 'horizontal':
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
window.customElements.define('paper-ice-hockey-player', PaperIceHockeyPlayer);
