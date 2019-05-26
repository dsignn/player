import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperResource extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

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
                    @apply --application-paper-card-left-content;
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
                        <paper-icon-button id="previewButton" icon="resource:preview" on-tap="_openPreview"></paper-icon-button>
                        <paper-tooltip for="previewButton" position="right">{{localize('preview-resource')}}</paper-tooltip>
                    </div>
                </div>
                <div id="rightSection">
                    <div id="content">
                        <div class="name">{{entity.name}}</div>
                        <div class="size">
                            <div>{{size}} {{sizeLabel}}</div>
                        </div>
                        <template is="dom-if" if="{{entity.dimension.height}}">
                            <div class="dimension">{{entity.dimension.width}} px {{entity.dimension.height}} px</div>
                        </template>
                        <template is="dom-if" if="{{entity.fps}}">
                            <div class="video">{{entity.fps}} fps</div>
                        </template>
                    </div>
                    <div id="crud">
                        <paper-menu-button ignore-select horizontal-align="right">
                            <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                            <paper-listbox slot="dropdown-content" multi>
                                <paper-item on-click="_update">{{localize('modify')}}</paper-item>
                                <paper-item  on-click="_delete">{{localize('delete')}}</paper-item>
                            </paper-listbox>
                        </paper-menu-button>
                    </div>
                </div>
            </paper-card>
            <paper-dialog id="previewDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation" on-iron-overlay-closed="_closePreview">
                <div class="title">Preview</div>
                <paper-dialog-scrollable>
                   <div id="contentPreview"></div>
                </paper-dialog-scrollable>
            </paper-dialog>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {
            services : {
                value : {
                    "StorageContainerAggregate": {
                        "resourceStorage":"ResourceStorage"
                    },
                    "resourceService" : "ResourceService"
                }
            },

            resourceStorage : {
                observer: 'observerStorageToUpdateEntity'
            },

            entity: {
                observer: '_entityChanged'
            }
        }
    }

    /**
     * @param newValue
     * @private
     */
    _entityChanged(newValue) {

        if (!newValue) {
            return;
        }

        this._updateSize(newValue.size);
        this._updateLeftImageHtml();
    }

    /**
     * @private
     */
    _closePreview() {
        let element = this.$.contentPreview.firstChild;
        switch (true) {
            case this.entity instanceof AudioEntity === true:
            case this.entity instanceof ImageEntity === true:
            case this.entity instanceof VideoEntity === true:
                element.src = '';
                break;
        }
        this.$.contentPreview.innerHTML = '';
    }


    /**
     * @param evt
     * @private
     */
    _openPreview(evt) {
        let element  = null;
        switch (true) {
            case this.entity instanceof ImageEntity === true:
                element = document.createElement('img');
                element.src = this.resourceService.getResourcePath(this.entity)  + '?' + new Date().getTime();
                break;
            case this.entity instanceof AudioEntity === true:
            case this.entity instanceof VideoEntity === true:
                element = document.createElement('video');
                element.src = this.resourceService.getResourcePath(this.entity)  + '?' + new Date().getTime();
                element.setAttribute('autoplay', true);
                element.setAttribute('controls', true);
                break;
            case this.entity instanceof FileEntity === true:
                if (!customElements.get(this.entity.wcName)) {

                    import(this.resourceService.getResourcePath(this.entity).replace('.html', '.js'))
                        .then((module) => {
                            element = document.createElement(this.entity.wcName);
                            element.createMockData();
                        }).catch((reason) => {
                            console.error(`Web component ${this.entity.wcName}`, reason);
                        });

                } else {
                    element = document.createElement(this.entity.wcName);
                    element.createMockData();
                }
                break;
        }

        if (element) {
            this.$.contentPreview.append(element);

            switch (true) {
                case element.tagName === 'VIDEO':
                case element.tagName === 'IMG':
                    element.addEventListener(
                        element.tagName === 'IMG' ? 'load' : 'playing',
                        () => {
                            this.$.previewDialog.open();
                        }
                    );
                    break;
                default:
                    this.$.previewDialog.open();
            }

        }
    }

    /**
     * @param {Number} size
     * @private
     */
    _updateSize(size) {
        let unit, units = ["TB", "GB", "MB", "KB", "Byte"];
        for (unit = units.pop(); units.length && size >= 1024; unit = units.pop()) {
            size /= 1024;
        }

        this.size = Math.ceil(size);
        this.sizeLabel = unit;
    }

    /**
     * @private
     */
    _updateLeftImageHtml() {

        this.$.leftSection.className = '';
        switch (true) {
            case this.entity instanceof ImageEntity:
                this.$.leftSection.classList.add("imgBackground");
                break;
            case this.entity instanceof VideoEntity:
                this.$.leftSection.classList.add("videoBackground");
                break;
            case this.entity instanceof AudioEntity:
                this.$.leftSection.classList.add("audioBackground");
                break;
            default:
                this.$.leftSection.classList.add("webBackground");
                break;
        }
    }

    /**
     * @param evt
     * @private
     */
    _update(evt) {
        this.dispatchEvent(new CustomEvent('update', {detail: this.entity}));
    }

    /**
     * @param evt
     * @private
     */
    _delete(evt) {
        this.dispatchEvent(new CustomEvent('delete', {detail: this.entity}));
    }
}
window.customElements.define('paper-resource', PaperResource);
