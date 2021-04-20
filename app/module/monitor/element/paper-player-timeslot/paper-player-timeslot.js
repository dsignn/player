import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";

/**
 * @customElement
 * @polymer
 */
class PaperPlayerTimeslot extends ServiceInjectorMixin(PolymerElement) {


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
                    background-size: contain;
                }
    
                video {
                    height: 100%;
                    width: 100%;
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
            timeslot: {
                type: Object,
                observer: '_changeTimeslot'
            },

            /**
             * @type string
             */
            timeslotId: {
                type: String,
                reflectToAttribute: true,
            },

            /**
             * Is the of the Object that may contain the timeslot EX. playlist
             * @type string
             */
            wrapperTimeslotId: {
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
        /*
        for (let cont = 0; this.timeslot.resources.length > cont; cont++) {

            switch (true) {
                // TODO add regex on type
                case this.timeslot.resources[cont] instanceof ImageEntity === true:

                    this.$.resources.appendChild(
                        this._creteImage(this.timeslot.resources[cont])
                    );
                    break;
                case this.timeslot.resources[cont] instanceof VideoEntity === true:
                    this.$.resources.appendChild(
                        this._createVideo(this.timeslot.resources[cont])
                    );
                    break;
                case this.timeslot.resources[cont] instanceof AudioEntity === true:
                    this.$.resources.appendChild(
                        this._createAudio(this.timeslot.resources[cont])
                    );
                    break;
                case this.timeslot.resources[cont] instanceof FileEntity === true:
                    this._createWebComponent(this.timeslot.resources[cont])
                        .then(
                            function(data) {
                                this.$.resources.appendChild(data);
                            }.bind(this)
                        )
                        .catch(
                            function(data) {
                                console.warn(data);
                            }
                        );
                    break;
                default:
                    // TODO log error
                    console.error('Resource type not found', this.timeslot.resource[cont]);
            }
        }
         */
    }

    _changeTimeslot(timeslot) {

        if(!timeslot) {
            return;
        }

        for (let cont = 0; this.timeslot.resources.length > cont; cont++) {

            switch (true) {
                // TODO add regex on type
                case this.timeslot.resources[cont] instanceof ImageEntity === true:

                    this.$.resources.appendChild(
                        this._creteImage(this.timeslot.resources[cont])
                    );
                    break;
                case this.timeslot.resources[cont] instanceof VideoEntity === true:
                    this.$.resources.appendChild(
                        this._createVideo(this.timeslot.resources[cont])
                    );
                    break;
                case this.timeslot.resources[cont] instanceof AudioEntity === true:
                    this.$.resources.appendChild(
                        this._createAudio(this.timeslot.resources[cont])
                    );
                    break;
                case this.timeslot.resources[cont] instanceof FileEntity === true:
                    this._createWebComponent(this.timeslot.resources[cont])
                        .then(
                            function(data) {
                                this.$.resources.appendChild(data);
                            }.bind(this)
                        )
                        .catch(
                            function(data) {
                                console.warn(data);
                            }
                        );
                    break;
                default:
                    // TODO log error
                    console.error('Resource type not found', this.timeslot.resource[cont]);
            }
        }
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
        // TODO memory leak controll for all resource
    }

    /**
     * @param timeslot
     * @param context
     */
    config(timeslot, context = {}) {
        this.timeslot = timeslot;
        this.timeslotId = timeslot.id;
        this.wrapperTimeslotId = context.serviceId;
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
     * TODO remove when add autoload services in player, this.timeslot will be a Timeslot object
     */
    _hasResourceType(type)  {
        return !!this.timeslot.resources.find((resource) => {
            return resource.type.indexOf(type) > -1;
        });
    }

    /**
     * Create image tag
     *
     * @private
     * @param resource
     * @return Element
     */
    _creteImage(resource) {

        let element = document.createElement('div');

        element.classList.add("image");
        element.style.backgroundImage = `url('${this.resourceService.getResourcePath(resource)}?${Date.now()}')`;

        let container = this._createResourceDiv();
        container.appendChild(element);
        return container;
    }

    /**
     * Create video tag
     *
     * @private
     * @param resource
     * @return Element
     */
    _createVideo(resource) {

        let element = document.createElement('video');
        element.src = `${this.resourceService.getResourcePath(resource)}?${Date.now()}`;
        element.setAttribute('preload', null);
        element.autoplay = true;
        element.setAttribute('muted', true); // TODO remove use to debug
        element.loop = this.timeslot.rotation === TimeslotEntity.ROTATION_LOOP ? true : false;
        element.muted = !this.timeslot.enableAudio;

        if (this.startAt > 0) {
            element.currentTime = this.startAt;
        }

        if (element.rotation !== TimeslotEntity.ROTATION_LOOP) {
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
     * @param resource
     * @return Element
     */
    _createAudio(resource) {
        let element = document.createElement('audio');
        element.setAttribute('hidden', '');
        element.src = this.resourceService.getResourcePath(resource);
        element.loop = this.timeslot.rotation === TimeslotEntity.ROTATION_LOOP ? true : false;
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
     * @param {GenericFile} resource
     * @return Element
     */
    async _createWebComponent(resource) {
        let fs = require('fs');
        let promise = new Promise( function(resolve, reject) {

            let entryPoint = this.resourceService.getResourcePath(resource);
            switch (true) {
                case customElements.get(resource.wcName) !== undefined:
                    resolve(this._initWebComponent(resource.wcName));
                    break;
                case fs.existsSync(entryPoint) === true:
                    import(entryPoint)
                        .then((module) => {
                            resolve(this._initWebComponent(resource.wcName));
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
     * @return element
     */
    _initWebComponent(name) {
        let element = document.createElement(name);
        element.height = this.height;
        element.width = this.width;

        if (Array.isArray(this.data)) {
            for (let cont = 0; this.data.length > cont; cont++) {

                if (this.data === null || typeof this.data !== 'object') {
                    console.error('Wrong data for timeslot');
                    continue;
                }

                for (let property in this.data[cont]) {
                    console.log('INJECT IN WC', property, this.data[cont][property]);
                    element[property] = this.data[cont][property];
                }
            }
        }

        let container = this._createResourceDiv();
        container.appendChild(element);

        return container;
    }

    /**
     * @param currentTime
     */
    changeTime(currentTime) {
        if (!this.shadowRoot) {
            return;
        }

        let tags = this.shadowRoot.querySelectorAll('video, audio');
        for (let cont = 0; tags.length > cont; cont++) {
            tags[cont].currentTime = currentTime;
        }
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
     * @param currentTime
     */
    resume(currentTime) {
        if (!this.shadowRoot) {
            return;
        }

        let tags = this.shadowRoot.querySelectorAll('video, audio');
        for (let cont = 0; tags.length > cont; cont++) {
            if (currentTime) {
                console.log('CURRENT TIME', currentTime);
                tags[cont].currentTime = currentTime;
            }
            tags[cont].play();
        }
    }


    /**
     * For debug
     *
     * @private
     */
    _intervalDebug() {
        this._timeInterval = this._timeInterval == this.timeslot.duration ? 1 : this._timeInterval + 1;
        console.log('interval', this._timeInterval, this);
    }

}
window.customElements.define('paper-player-timeslot', PaperPlayerTimeslot);
