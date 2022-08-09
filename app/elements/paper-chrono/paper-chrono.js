import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {Time} from "@dsign/library/src/date/Time";
import { ChronoService } from '../../src/ChronoService';

export class PaperChrono extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    display: block;
                }

                .container-data {
                    display: flex;
                    justify-content: center;
                    font-size: 22px
                    @apply --paper-chrono-data;
                }

                .container-action {
                    display: flex;
                    justify-content: center;
                    padding-top: 12px;
                    padding-bottom: 12px;
    
                    @apply --paper-chrono-action;
                }

                .separator {
                    display: flex;
                    justify-content: center;
                    width: 12px;
                    @apply --paper-chrono-separator ;
                }

                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                    padding: 0;
                    height: 24px;
                    width: 24px;
                    line-height: 20px;
                    --paper-icon-button-disabled : {        
                        background-color: #c9c9c9 !important;
                    }
                }

                #pbtmPlay,
                #pbtmResume,
                #pbtmPause {
                    margin-right: 8px;
                }
            
            </style>
            <div class="container-data">
                <div id="hour">{{hour}}</div>
                <div class="separator">:</div>
                <div id="minute">{{minute}}</div>
                <div class="separator">:</div>
                <div id="hour">{{second}}</div>
            </div>
            <div class="container-action">
                <paper-icon-button id="pbtmPlay" class="circle" icon="play" on-tap="_play"></paper-icon-button>
                <paper-icon-button id="pbtmResume" class="circle" icon="resume" on-tap="_resume"></paper-icon-button>
                <paper-icon-button id="pbtmPause" class="circle" icon="pause" on-tap="_pause"></paper-icon-button>
                <paper-icon-button id="pbtmStop" class="circle" icon="stop" on-tap="_stop"></paper-icon-button>
            </div>

        `
    }

    static get properties() {
        return {

            time: {
                observer: 'timeChange',
                value:  function() {
                    let time = new Time();
                    // TODO modificare appena si scarica la libreria
                    time.id = new Date().getTime();
                    return time;
                }()
            },

            hour: {

            },

            minute: {

            },

            second: {

            },

            /**
             * @type object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    _chronoService: 'ChronoService'
                }
            },

            _chronoService: {
                observer: '_chronoServiceChange'
            }

        }
    }

    /**
     * @param {ChronoService}
     */
    _chronoServiceChange(service) {
        service.getEventManager().on(
            ChronoService.DATA,
            this.chronoData.bind(this)
        );

        service.getEventManager().on(
            ChronoService.PLAY,
            this._proxyEvt.bind(this)
        );

        service.getEventManager().on(
            ChronoService.RESUME,
            this._proxyEvt.bind(this)
        );

        service.getEventManager().on(
            ChronoService.PAUSE,
            this._proxyEvt.bind(this)
        );

        service.getEventManager().on(
            ChronoService.STOP,
            this._proxyEvt.bind(this)
        );
    }

    /**
     * @param {Time} time 
     */
    timeChange(time) {
        if (!time) {
            return
        }
        
        this._computeStatus();
        this._computeData();
    }

    /**
     * @param {Event} evt 
     */
    _proxyEvt(evt) {
        console.log('gggggggggggggggg', evt)
        if (true) {

        }
    }

    /**
     * @param {Event} evt 
     */
    chronoData(evt) {
  
        if (this.time.id == evt.data.id) {
            this.time = evt.data;

            this._computeStatus();
            this._computeData();
            this.dispatchEvent('update-chrono', this.time);
        }
    }

    /**
     * @param {Time} time 
     */
    _computeStatus() {
        switch(true) {
            case !this.time.status === true:
            case this.time.status == ChronoService.STATUS_IDLE:
                this.$.pbtmPlay.disabled = false;
                this.$.pbtmResume.disabled = true;
                this.$.pbtmPause.disabled = true;
                this.$.pbtmStop.disabled = true;
                break;
            case this.time.status == ChronoService.STATUS_RUNNING:
                this.$.pbtmPlay.disabled = true;
                this.$.pbtmResume.disabled = true;
                this.$.pbtmPause.disabled = false;
                this.$.pbtmStop.disabled = false;
                break;
            case this.time.status == ChronoService.STATUS_PAUSE:
                this.$.pbtmPlay.disabled = true;
                this.$.pbtmResume.disabled = false;
                this.$.pbtmPause.disabled = true;
                this.$.pbtmStop.disabled = false;
                break;    
        }
    }

    _computeData() {
        this.hour = this.time.getStringHours();
        this.minute = this.time.getStringMinutes();
        this.second = this.time.getStringSeconds();
    }

    _play(evt) {    
        console.log('_play', evt);
        this.play();
    }

    _pause(evt) {
        console.log('_pause', evt);
        this.pause();
    }

    _stop(evt) {
        console.log('_stop', evt);
        this.stop();
    }

    _resume(evt) {
        console.log('_resume', evt);
        this.resume();
    }

    play() {
        this._chronoService.play(this.time);
    }

    pause() {
        this._chronoService.pause(this.time);
    }

    stop() {
        this._chronoService.stop(this.time);
    }

    resume() {
        this._chronoService.resume(this.time);
    }
}

window.customElements.define('paper-chrono', PaperChrono);
