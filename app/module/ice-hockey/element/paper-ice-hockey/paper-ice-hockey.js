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
class PaperIceHockey extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
            <style >
                paper-card {
                    @apply --layout-horizontal;
                    @apply --application-paper-card;
                    margin-right: 4px;
                    margin-bottom: 4px;
                }
                
                #leftSection {
                    width: 80px;
                    min-height: 120px;
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
                    @apply --layout-flex;
                    padding: 4px;
                    word-break: break-all;
                    overflow: hidden;
                }  
                   
                paper-menu-button {
                    padding: 0;
                }
                
                .name {
                    overflow: hidden;
                    height: 20px;
                }
                
                .dimension, 
                .size,
                .video {
                    padding-top: 4px;
                    font-size: 14px;
                    font-style: italic;
                }
                
                .imgBackground {
                    background-image: url("../../module/resource/element/paper-resource/img/image.jpeg") !important;
                }
    
                .videoBackground {
                    background-image: url("../../module/resource/element/paper-resource/img/video.jpeg") !important;
                }
    
                .webBackground {
                    background-image: url("../../module/resource/element/paper-resource/img/web.jpeg") !important;
                }
    
                .audioBackground {
                    background-image: url("../../module/resource/element/paper-resource/img/audio.jpeg") !important;
                }

    
            </style>
            <paper-card>
                <div id="leftSection"></div>
                <div id="fastAction">
                    <div class="action">
                    </div>
                </div>
                <div id="rightSection">
                    <div id="content">
                        <div class="name">{{entity.name}}</div>
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

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {


            /**
             * @type FileEntity
             */
            entity: {
          //      observer: '_entityChanged'
            },

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
        this.dispatchEvent(new CustomEvent('update', {detail: this.entity}));
        this.$.crudButton.close();
    }
    
    /**
     * @param evt
     * @private
     */
    _delete(evt) {
        this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
        this.$.crudButton.close();
    }
}
window.customElements.define('paper-ice-hockey', PaperIceHockey);
