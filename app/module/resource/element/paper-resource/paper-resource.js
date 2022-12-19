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
import {lang} from './language/language';

/**
 * @customElement
 * @polymer
 */
class PaperResource extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                    position: relative;
                    width: 80px;
                    min-height: 120px;
                    background-size: cover;
                    background-position: center;
                    background-repeat: no-repeat;
                }
                
                #leftSection .action {
                    position: absolute;
                    bottom: 6px;
                    right: 6px;
                    z-index: 1;
                }

                paper-icon-button.circle-small {
                    @apply --application-paper-icon-button-circle;
                    background-color: var(--default-primary-color);
                    color:var(--text-primary-color);
                    height: 30px;
                    width: 30px;
                    padding: 4px;
                  
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

                #leftSection video  {
                    object-fit: cover;
                    height: 120px;
                    width: 80px;
                    position: absolute;
                    top: 0;
                    left: 0;
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

                .webBackground {
                    background-image: url("../../module/resource/element/paper-resource/img/web.jpeg") !important;
                }
    
                .audioBackground {
                    background-image: url("../../module/resource/element/paper-resource/img/audio.jpeg") !important;
                }

    
            </style>
            <paper-card>
                <div id="leftSection">
                    <div class="action">
                        <paper-icon-button id="previewButton" icon="resource:preview" on-tap="_openPreview" class="circle-small" ></paper-icon-button>
                        <paper-tooltip for="previewButton" position="right" >{{localize('preview-resource')}}</paper-tooltip>
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


            /**
             * @type FileEntity
             */
            entity: { },

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

    static get observers() {
        return [
            'changeEntity(_resourceService, _storage, entity)'
        ]
    }

    /**
     * @param newValue
     * @private
     */
     changeEntity(resourceStorage, storage, entity) {

        if (!resourceStorage || !storage || !entity) {
            return;
        }


        this._updateSize(entity.size);
        this._updateLeftImageHtml();
    }

    /**
     * @private
     */
    _closePreview() {
        let element = this.$.contentPreview.firstChild;

        if (!element) {
            return
        }

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
                element.src = this._resourceService.getResourcePath(this.entity)  + '?' + new Date().getTime();
                break;
            case this.entity instanceof AudioEntity === true:
            case this.entity instanceof VideoEntity === true:
                element = document.createElement('video');
                element.src = this._resourceService.getResourcePath(this.entity)  + '?' + new Date().getTime();
                element.setAttribute('autoplay', true);
                element.muted = true; // TODO remove for debug
                element.setAttribute('controls', true);
                break;
            case this.entity instanceof FileEntity === true:
                if (!customElements.get(this.entity.wcName)) {

                    import(this._resourceService.getResourcePath(this.entity).replace('.html', '.js'))
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
            this._closePreview();
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


        switch (true) {
            case this.entity instanceof ImageEntity:
                this.$.leftSection.style.backgroundImage = `url("${this._resourceService.getResourcePath(this.entity)}")`;
                break;
            case this.entity instanceof VideoEntity:       

                let video = document.createElement('video');
                video.setAttribute('width', 80);
                video.setAttribute('height', 120);
                video.setAttribute('preload', 'metadata');

                let source = document.createElement('source');
                source.setAttribute('src', `${this._resourceService.getResourcePath(this.entity)}#t=2`);

                video.appendChild(source);
                this.$.leftSection.appendChild(video);
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
window.customElements.define('paper-resource', PaperResource);
