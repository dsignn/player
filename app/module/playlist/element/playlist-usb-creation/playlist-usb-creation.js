import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { ServiceInjectorMixin } from "@dsign/polymer-mixin/service/injector-mixin";
import { LocalizeMixin } from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-button/paper-button';
import { lang } from './language';
import { EntityNestedReference } from "@dsign/library/src/storage/entity/EntityNestedReference";
import { PlaylistEntity } from './../../src/entity/PlaylistEntity';

/**
 * @customElement
 * @polymer
 */
class PaperUsbCreation extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>
                paper-dialog {
                    padding:20px;
                }
            </style>
            <paper-dialog id="usbDialog" entry-animation="scale-up-animation" exit-animation="fade-out-animation" with-backdrop>
                <div>{{localize('header')}}</div>
                <div>
                    <dom-repeat id="menu" items="{{files}}" as="file">
                        <template> 
                            <div>[[file]]<div>
                        </template>
                    </dom-repeat>
                </div>
                <iron-form id="usb-form">
                    <form method="post">
                        <paper-input id="name" label="{{localize('name-playlist')}}" required></paper-input>
                        <paper-button on-tap="submitUsbButton">{{localize('save')}}</paper-button>
                    </form>
                </iron-form>

            </paper-dialog>`
    }

    static get properties() {
        return {

            path: {

            },

            files: {

            },

            services: {
                value: {
                    _localizeService: 'Localize',
                    _usbService: 'UsbService',
                    _resourceService: 'ResourceService',
                    _playlistAutoCreationService: 'PlaylistAutoCreationService',
                    _playlistService: 'PlaylistService',
                    _monitorService: 'MonitorService',
                    StorageContainerAggregate : {
                        _storage :"ResourceStorage",
                        _storagePlaylist :"PlaylistStorage"
                    }

                }
            },

            _usbService: {
                readOnly: true,
                observer: '_usbServiceChanged'
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();
        this.$['usb-form'].addEventListener('iron-form-presubmit', this.submitUsb.bind(this));
    }

    /**
     * @param evt
     */
    submitUsbButton(evt) {
        this.$['usb-form'].submit();
    }

    /**
     * @param evt
     */
    submitUsb(evt) {
        evt.preventDefault();

        if (!this._monitorService.getEnableMonitor()) {
            console.warn('No default monitor selected');
            // TODO ERROR
            return;
        }

        let promises = [];
        for (let cont = 0; this.files.length > cont; cont++) {
           
          
            let path =  `${this.path}/${this.files[cont]}`;
            promises.push(this._resourceService.getFileFromPath(path));

        }

        Promise.all(promises)
                .then((files) => {
                    
                    let promises = [];
            
                    for (let cont = 0; files.length > cont; cont++) {
                        let entity = {};
                        entity = this._storage.hydrator.hydrate(files[cont]);
                        entity.resourceToImport = files[cont];                        
                        promises.push(this._storage.save(entity));
                    }

                    Promise.all(promises)
                        .then((resources) => {
                            console.log('RESOURCES', resources);
                            
                            let playlist = new PlaylistEntity();
                            playlist.name = this.$.name.value;
                            playlist.setRotation(PlaylistEntity.ROTATION_LOOP);

                            let monitor = this._monitorService.getEnableMonitor();
                            let container = monitor.getMonitors()[0];

                            let monitorReference = new EntityNestedReference();
                            monitorReference.setId(container.getId());
                            monitorReference.setParentId(monitor.getId());
                            monitorReference.setCollection('monitor');
                            monitorReference.name = monitor.name;
                           
                            playlist.monitorContainerReference = monitorReference;

                            for(let cont = 0; resources.length > cont; cont++) {
                                let reference = {};
                                reference.id = resources[cont].id;
                                reference.name = resources[cont].name;
                                playlist.appendResource(reference)
                            }

                            this._storagePlaylist.save(playlist)
                                .then((playlist) => {
                                   
                                    // TODO GESTIRE STATI PER IL PROCESAMENTO RISORSE
                                    setTimeout(
                                        () => {
                                            this._playlistService.play(playlist);
                                        },
                                        3000
                                    );
                                   
                                    this.close();
                                });
                        }) 
    
                });
    }

    _usbServiceChanged(service) {
        if (!service) {
            return;
        }

        service.getEventManager().on('attach-usb', this._attachUsbEvt.bind(this));
    }

    open() {
        this.$.usbDialog.open();
    }

    close() {
        this.$.usbDialog.close();
    }

    async _attachUsbEvt(evt) {


        let path = this._playlistAutoCreationService._searchMntPath(evt.data);
        if (!path) {
            console.warn('Path in mount usb not found', evt.data);
            return;
        }

        this._playlistAutoCreationService.getListResource(path)
            .then((files) => {
                if (files.length > 0) {
                    this.files = files;
                    this.path = path;
                    this.open();
                }
            })
            .catch((error) => {
                console.error(error);
            });
    }
}

window.customElements.define('playlist-usb-creation', PaperUsbCreation);
