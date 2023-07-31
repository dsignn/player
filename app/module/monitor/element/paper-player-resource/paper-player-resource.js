import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import { VideoEntity } from '../../../resource/src/entity/VideoEntity';
import { ImageEntity } from '../../../resource/src/entity/ImageEntity';


/**
 * @customElement
 * @polymer
 */
class PaperPlayerResource extends ServiceInjectorMixin(PolymerElement) {


    static get template() {
        return html`
             <style>
                #resources {
                    display: block;
                    height: 100%;
                    width: 100%;
                    position: relative;
                }
                
                [hidden] {
                    background-color: red;
                    visibility: hidden;
                }
    
                .resource {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                    top:0;
                    left: 0;
                }
    
                div.image {
                    height: 100%;
                    width: 100%;
                    background-position: center;
                    background-repeat: no-repeat;
                    background-size: cover;
                }
    
                video {
                    object-fit: fill;
                }
    
            </style>
            <div id="resources">
    
            </div>
        `
    }

    static get properties () {
        return {

            /**
             * @type object
             */
            resourceEntity: {
                type: Object,
                observer: '_changeResourceEntity'
            },

            /**
             * @type string
             */
            resourceId: {
                type: String,
                reflectToAttribute: true,
            },

            /**
             * Id of the other service
             * @type string
             */
            wrapperResourceId: {
                type: String,
                reflectToAttribute: true
            },

            /**
             * @type number
             */
            height: {
                type: Number,
                notify : true
            },

            /**
             * @type number
             */
            width: {
                type: Number,
                notify : true
            },

            /**
             * @type number
             */
            startAt: {
                type: Number,
                value : 0
            },

            /**
             * @type object
             */
            filters: {
                type: Object,
                observer: '_changeFilters'
            },

            /**
             * @type object
             */
            data: {
                type: Object,
                notify: true,
                value: {}
            },

            /**
             * @type string
             */
            basePath : {
                type: String,
                readOnly : true
            },

            /**
             * For debug
             * @type number
             */
            _timeInterval: {
                type: Number,
                value : 0
            }
        }
    }

    /**
     * callback when attach element
     */
    connectedCallback() {
        super.connectedCallback();
    }

    async _changeResourceEntity(resourceEntity) {
        console.log('APPEND RESOURCE ', resourceEntity);
        if(!resourceEntity || !resourceEntity.resourceReference) {
            return;
        }

        this.resourceId = resourceEntity.id;


       let element;
        switch (true) {
            // TODO add regex on type
            case resourceEntity.resourceReference instanceof ImageEntity === true:
                console.log('Arrivato ImageEntity');

                this.$.resources.appendChild(await this._createElementFromEntityResource(resourceEntity.resourceReference));
                this.adjust(resourceEntity.resourceReference.adjust);
                break;

            case resourceEntity.resourceReference instanceof VideoEntity === true:
                console.log('Arrivato VideoEntity');
            
                this.$.resources.appendChild(await this._createElementFromEntityResource(resourceEntity.resourceReference));
                this.adjust(resourceEntity.resourceReference.adjust);
                this.muted(!resourceEntity.resourceReference.enableAudio);
                break;

            case resourceEntity.resourceReference instanceof AudioEntity === true:
                console.log('Arrivato AudioEntity');
        
                this.$.resources.appendChild(await this._createElementFromEntityResource(resourceEntity.resourceReference));
                this.muted(!resourceEntity.resourceReference.enableAudio);
                break;

            case resourceEntity.resourceReference instanceof MetadataEntity === true:
                console.log('Arrivato MetadataEntity');
            
                this.$.resources.appendChild(await this._createWebComponent(resourceEntity.resourceReference));
                break;
            case resourceEntity.resourceReference instanceof MultiMediaEntity === true:
                for(let cont = 0; resourceEntity.resourceReference.resources.length > cont; cont++) {
                    let element = await this._createElementFromEntityResource(resourceEntity.resourceReference.resources[cont]);
                    element.style.zIndex = cont+1;
                    
                    this.$.resources.appendChild(element);
                }
                this.adjust(resourceEntity.resourceReference.adjust);
                this.muted(!resourceEntity.resourceReference.enableAudio);
                break;
            default:
                // TODO log error
                console.error('Resource type not found', resourceEntity.resourceReference);
        }
    }

    /**
     * 
     * @param {ResourceEntity} entity 
     * @returns 
     */
    async _createElementFromEntityResource(entity) {
        let element;
        switch (true) {
            // TODO add regex on type
            case entity instanceof ImageEntity === true:
                element =  this._creteImage(entity);
                break;

            case entity instanceof VideoEntity === true:            
                element = this._createVideo(entity);
                break;

            case entity instanceof AudioEntity === true:
                element = this._createAudio(entity);            
                break;

            case entity instanceof MetadataEntity === true:
                console.log('Arrivato MetadataEntity dentro');
                element = await this._createWebComponent(entity);
                break;
            }
        return element
    }

    /**
     * callback when remove element
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this._handlarInterval) {
            window.clearInterval(this._handlarInterval);
        }

        let videos = this.shadowRoot.querySelectorAll('video');
        for (let cont = 0; videos.length > cont; cont++) {
            videos[cont].pause();
            videos[cont].src = '';
            videos[cont].load();
            videos[cont].remove();
        }

        let images = this.shadowRoot.querySelectorAll('.image');
        for (let cont = 0; images.length > cont; cont++) {
            images[cont].style.backgroundImage = '';
        }
    }

    /**
     * Create div resource that wrap resource
     *
     * @private
     * @return Element
     */
    _createResourceDiv() {
        let element = document.createElement('div');
        element.classList.add("resource");
        return element;
    }

    /**
     * @param newValue
     * @param oldValue
     * @private
     */
    _changeFilters(newValue, oldValue) {
        if (!newValue) {
            return;
        }

        let filter = '';
        for (var property in newValue) {
            switch (true) {
                case property === 'blur' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== ''  :
                    console.log('BLUR', newValue[property]);
                    filter = `${filter} blur(${newValue[property]}px)`;
                    break;
                case property === 'brightness' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('BRIGHTNESS', newValue[property]);
                    filter = `${filter} brightness(${newValue[property]}%)`;
                    break;
                case property === 'contrast' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('CONTRAST', newValue[property]);
                    filter = `${filter} contrast(${newValue[property]}%)`;
                    break;
                case property === 'grayscale' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('GRAYSCALE', newValue[property]);
                    filter = `${filter} grayscale(${newValue[property]}%)`;
                    break;
                case property === 'hueRotate' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('HUEROTATE', newValue[property]);
                    filter = `${filter} hue-rotate(${newValue[property]}deg)`;
                    break;
                case property === 'invert' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('INVERT', newValue[property]);
                    filter = `${filter} invert(${newValue[property]}%)`;
                    break;
                case property === 'opacity' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('OPACITY', newValue[property]);
                    filter = `${filter} opacity(${newValue[property]}%)`;
                    break;
                case property === 'saturate' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('SATURATE', newValue[property]);
                    filter = `${filter} saturate(${newValue[property]}%)`;
                    break;
                case property === 'sepia' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('SEPIA', newValue[property]);
                    filter = `${filter} sepia(${newValue[property]}%)`;
                    break;
                case property === 'dropShadow' && newValue[property] !== undefined && newValue[property] !== null  && newValue[property] !== '' :
                    console.log('DROPSHADOW', newValue[property]);
                    filter = `${filter} drop-shadow(${newValue[property]}%)`;
                    break;
            }
        }

        if (filter) {
            this.$.resources.style.filter = filter;
        }
    }

    /**
     * Create image tag
     *
     * @private
     * @param { ImageEntity } resource
     * @return Element
     */
    _creteImage(resource, options) {

        let element = document.createElement('div');

        element.classList.add("image");

        try {
            let url = new URL(`${this.resourceService.getResourcePath(resource)}?${Date.now()}`);
            element.style.backgroundImage = `url('${url.href}')`;
        } catch(error) {
            element.style.backgroundImage = `url('${this.resourceService.getResourcePath(resource)}?${Date.now()}')`;
            console.warn(error);
        }

        let container = this._createResourceDiv();
        container.appendChild(element);
        return container;
    }

    /**
     * Create video tag
     *
     * @private
     * @param { VideoEntity } resource
     * @return Element
     */
    _createVideo(resource) {

        let element = document.createElement('video');
       
        try {
            let url = new URL(`${this.resourceService.getResourcePath(resource)}?${Date.now()}`);
            element.src = `${url.href}`;
        } catch(error) {
            element.src = `${this.resourceService.getResourcePath(resource)}?${Date.now()}`;
            console.warn(error);
        }

        element.setAttribute('preload', null);
        element.autoplay = true;
        element.setAttribute('muted', true); // TODO remove use to debug
        element.loop = resource.rotation === FileEntity.ROTATION_LOOP ? true : false;

        if (this.startAt > 0) {
            element.currentTime = this.startAt;
        }

        if (element.rotation !== FileEntity.ROTATION_LOOP) {
            let isRunning = true;
            element.addEventListener('timeupdate', function() {
                if ((this.currentTime + 0.5) >= this.duration && isRunning) {
                    this.pause();
                    isRunning = false;
                }
            }, false);
        }

        let container = this._createResourceDiv();
        container.appendChild(element);
        return container;
    }

    /**
     * Create audio tag
     *
     * @private
     * @param { AudioEntity } resource
     * @return Element
     */
    _createAudio(resource) {
        let element = document.createElement('audio');
        element.setAttribute('hidden', '');
        try {
            let url = new URL(`${this.resourceService.getResourcePath(resource)}?${Date.now()}`);
            element.src = url.href;
        } catch(error) {
            element.src = `${this.resourceService.getResourcePath(resource)}?${Date.now()}`;
            console.warn(error);
        }
       
        element.loop = resource.rotation === FileEntity.ROTATION_LOOP ? true : false;
        if (this.startAt > 0) {
            element.currentTime = this.startAt;
        }
        element.play();

        return element;
    }

    /**
     * Create webview
     *
     * @private
     * @param { MetadataEntity } resource
     * @return Element
     */
    async _createWebComponent(resource) {
        let fs = require('fs');
        let promise = new Promise( function(resolve, reject) {

            let entryPoint = this.resourceService.getResourcePath(resource);
            console.log('WC', resource);
            switch (true) {
                case customElements.get(resource.wcName) !== undefined:
                    resolve(this._initWebComponent(resource));
                    break;
                case fs.existsSync(entryPoint) === true:
                    import(entryPoint)
                        .then((module) => {
                            resolve(this._initWebComponent(resource));
                        })
                        .catch((err) => {
                            reject(err);
                        });
                    break;
                default:
                    console.warn(`Web component entry point not found: ${entryPoint}`);
                    reject(`Web component entry point not found: ${entryPoint}`);

            }
        }.bind(this));
        return promise;
    }

    /**
     * @param { MetadataEntity } resource
     * @return element
     */
    _initWebComponent(resource) {
        let element = document.createElement(resource.wcName);
        element.height = this.height;
        element.width = this.width;
        element.resource = resource;

        if (this.data) {
            for (const property in this.data) {
                element[property] = this.data[property];
            }
        }

        let container = this._createResourceDiv();
        container.appendChild(element);

        return container;
    }

    /**
     *
     */
    pause() {
        if (!this.shadowRoot) {
            return;
        }

        let tags = this.shadowRoot.querySelectorAll('video, audio');
        for (let cont = 0; tags.length > cont; cont++) {
            tags[cont].pause();
        }
    }

    /**
     * @param entity
     */
    resume(resourceEntity) {
        if (!this.shadowRoot || !resourceEntity) {
            return;
        }

        let tags = this.shadowRoot.querySelectorAll('video, audio');
        for (let cont = 0; tags.length > cont; cont++) {
       
            tags[cont].currentTime = resourceEntity.getCurrentTime();
            tags[cont].play();
        }
    }

    /**
     * @param {boolean} isMuted 
     */
    muted(isMuted) {
        let tags = this.shadowRoot.querySelectorAll('video, audio');
        for (let cont = 0; tags.length > cont; cont++) { 
            tags[cont].muted = isMuted;
        }
    } 

    /**
     * @param {string} adjust 
     */
    adjust(adjust) {
        let tags = this.shadowRoot.querySelectorAll('video, .image');

        for (let cont = 0; tags.length > cont; cont++) { 
           
            if (tags[cont].className == 'image') {
                if(adjust == 'size-normal') {
                    tags[cont].style.backgroundSize = 'auto';
                    tags[cont].style.backgroundPosition = '0 0';
                }

                if(adjust == 'size-contain') {
                    tags[cont].style.backgroundSize = 'cover';
                    tags[cont].style.backgroundPosition = 'center center';
                }
            }

            if (tags[0].tagName == 'VIDEO') {
                if(adjust == 'size-normal') {
                    tags[cont].removeAttribute('height');
                    tags[cont].removeAttribute('width');
                }

                if (adjust === 'size-contain') {
                    tags[cont].setAttribute('height', '100%'); // TODO remove use to debug
                    tags[cont].setAttribute('width', '100%');
                }
        
            }
        }
    }
}
window.customElements.define('paper-player-resource', PaperPlayerResource);
