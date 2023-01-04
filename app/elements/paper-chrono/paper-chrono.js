import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {Time} from "@dsign/library/src/date/Time";
import { ChronoService } from '../../src/ChronoService';
import {lang} from './language';

import './paper-chrono-dialog.js';

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
                #pbtCountDown,
                #pbtModify,
                #pbtmResume,
                #pbtmPause {
                    margin-right: 8px;
                }
            
            </style>
            <div class="container-data">
                <div id="hour">{{hours}}</div>
                <div class="separator">:</div>
                <div id="minute">{{minutes}}</div>
                <div class="separator">:</div>
                <div id="second">{{seconds}}</div>
            </div>
            <div class="container-action">
                <paper-icon-button id="pbtCountDown" class="circle" icon="timer" on-tap="_countDown"></paper-icon-button>
                <paper-tooltip for="pbtCountDown" position="bottom">{{localize(time.type)}}</paper-tooltip>
                <paper-icon-button id="pbtModify" class="circle" icon="insert" on-tap="_modify"></paper-icon-button>
                <paper-tooltip for="pbtModify" position="bottom">{{localize('modify')}}</paper-tooltip>
                <paper-icon-button id="pbtmPlay" class="circle" icon="play" on-tap="_play"></paper-icon-button>
                <paper-tooltip for="pbtmPlay" position="bottom">{{localize('play')}}</paper-tooltip>
                <paper-icon-button id="pbtmResume" class="circle" icon="resume" on-tap="_resume"></paper-icon-button>
                <paper-tooltip for="pbtmResume" position="bottom">{{localize('resume')}}</paper-tooltip>
                <paper-icon-button id="pbtmPause" class="circle" icon="pause" on-tap="_pause"></paper-icon-button>
                <paper-tooltip for="pbtmPause" position="bottom">{{localize('pause')}}</paper-tooltip>
                <paper-icon-button id="pbtmStop" class="circle" icon="stop" on-tap="_stop"></paper-icon-button>
                <paper-tooltip for="pbtmStop" position="bottom">{{localize('stop')}}</paper-tooltip>
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

            hours: {

            },

            minutes: {

            },

            seconds: {

            },

            type: {

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
    
    constructor() {
        super();
        this.resources = lang;
    }

    connectedCallback() {
        super.connectedCallback();

        let ele = document.createElement('paper-chrono-dialog');
        this.idDialog = this.__randomString();
        ele.setAttribute('id', this.idDialog);

        ele.addEventListener("update-chrono", (evt) => {
            this.time.hours = evt.detail.hours;
            this.time.minutes = evt.detail.minutes;
            this.time.seconds = evt.detail.seconds;
            this._computeStatus();
            this._computeData();
            this._chronoService.jump(this.time);
        });
          
        document.body.appendChild(ele);
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
        
        this._computeType();
        this._computeStatus();
        this._computeData();
    }

    /**
     * @param {Event} evt 
     */
    _proxyEvt(evt) {
        if (!!this.time && evt.data.id == this.time.id) {
            this._computeStatus();
            this._computeData();
            this.dispatchEvent(new CustomEvent( evt.name, {detail:  evt.data}));
        }
    }

    _countDown(evt) {
        if (!this.time.type || this.time.type === ChronoService.TYPE_TIMER) {
            this.time.type = ChronoService.TYPE_COUNTDOWN;
        } else {
            this.time.type = ChronoService.TYPE_TIMER;
        }
        this._computeType();
    }

    /**
     * @param {Event} evt 
     */
    chronoData(evt) {
  
        if (this.time.id == evt.data.id) {
            this.time = evt.data;

            this._computeType();
            this._computeStatus();
            this._computeData();
            this.dispatchEvent(new CustomEvent( evt.name, {detail:  evt.data}));
        }
    }

    _computeType() {
        this.type = !this.time.type ? ChronoService.TYPE_TIMER : this.time.type; 
        this.shadowRoot.querySelector('[for="pbtCountDown"]').innerHTML = this.localize(this.type);
    }

    /**
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

    /**
     * 
     * @returns {string}
     */
    __randomString() {
        return Math.random().toString(16).substr(2, 8);
    }

    _computeData() {
        this.hours = this.time.getStringHours();
        this.minutes = this.time.getStringMinutes();
        this.seconds = this.time.getStringSeconds();
    }

    _play(evt) {    
        this.play();
    }

    _pause(evt) {
        this.pause();
    }

    _stop(evt) {
        this.stop();
    }

    _resume(evt) {
        this.resume();
    }

    _modify(evt) {
        let ele = document.querySelector(`[id='${this.idDialog}']`);
        if (ele) {
            ele.hours = this.hours;
            ele.minutes = this.minutes;
            ele.seconds = this.seconds;
            ele.open();
        } else {
            console.warn('Chrono dialog not found');
        } 
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
