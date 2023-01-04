import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {Time} from "@dsign/library/src/date/Time";

import '@polymer/paper-card/paper-card.js';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js';
import {lang} from './language';

export class PaperChronoDialog extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                .container {
                    display: flex;
                    flex-direction: row;
                }

                paper-input {
                    width: 130px;
                    padding-right: 4px;
                }
             
            
            </style>
            <paper-dialog id="dialog" with-backdrop>
                <paper-card elevation="0"> 
                    <div class="container">
                        <paper-input id="hour" label="{{localize('hours')}}" value="{{hours}}"></paper-input>
                        <paper-input id="minute" label="{{localize('minutes')}}" value="{{minutes}}"></paper-input>
                        <paper-input id="second" label="{{localize('seconds')}}" value="{{seconds}}"></paper-input>
                    </div>
                    <div class="container">
                        <paper-button on-tap="notifyTime">{{localize('modify')}}</paper-button>
                    </div>
                </paper-card>
            </paper-dialog">
        `
    }

    static get properties () {
        return {
            hours: {

            },

            minutes: {

            },

            seconds: {

            },

            services : {
                value : {
                    _localizeService: 'Localize'
                }
            },
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }
    
    open() {
        this.$.dialog.open();
    }

    close() {
        this.$.dialog.close();
    }

    /**
     * @param {Event} evt 
     */
    notifyTime(evt) {
        let time = new Time();
        time.seconds = this.seconds;
        time.minutes = this.minutes;
        time.hours = this.hours;
        let event = new CustomEvent('update-chrono', {detail: time} );
        this.dispatchEvent(event);
        this.close();
    }
}

window.customElements.define('paper-chrono-dialog', PaperChronoDialog);
