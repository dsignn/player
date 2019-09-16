import {PolymerElement, html} from '@polymer/polymer/polymer-element'

/**
 *
 */
class WcResourceTimer extends PolymerElement {

    static get template() {
        return html`
        <style>

            .timer {
                padding: 0;
                height: 100%;
                width: 100%;
                color: white;
                font-size: 30px;
            }

            .hidden {
                display: none;
            }

        </style>
            <div id="timer" class="timer hidden">
                {{hours}}:{{minutes}}:{{seconds}}
            </div>
        </template>
        `;
    }

    static get properties() {
        return {

            timer: {
                type: Object,
                notify: true,
                observer: '_timerChanged',
                value: new TimerEntity()
            },

            hours: {
                type: String,
                notify: true,
            },

            minutes: {
                type: String,
                notify: true,
            },

            seconds: {
                type: String,
                notify: true,
            },

        };
    }

    ready() {
        super.ready();

        require('electron').ipcRenderer.on(TimerService.DATA, this._updateTimer.bind(this));
        require('electron').ipcRenderer.on(TimerService.START, this._updateTimer.bind(this));
        setTimeout(
            () => { this.$.timer.classList.remove('hidden')},
            1100
        )
    }

    /**
     * @param newValue
     */
    _timerChanged(newValue) {
        if (!newValue) {
            return;
        }
    }

    /**
     * @param evt
     * @param msg
     * @private
     */
    _updateTimer(evt, msg) {
        if (msg.id !== this.timer.id) {
            return;
        }

        this.hours = msg.timer.timer.hours;
        this.minutes = msg.timer.timer.minutes;
        this.seconds =  msg.timer.timer.seconds;
    }

    /**
     *
     */
    createMockData() {
        this.hours = '10';
        this.minutes = '10';
        this.seconds = '10';
    }
}


window.customElements.define('wc-resource-timer', WcResourceTimer);
