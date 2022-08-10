import { IceHockeyMatch } from '@dsign/library/src/sport/ice-hockey/match/IceHockeyMatch';
import {html, PolymerElement} from '@polymer/polymer/polymer-element'

/**
 *
 */
class WcResourceIceHockeyScoreboard extends PolymerElement {

    static get template() {
        return html`
        <style>

            :host {
                display: block;
                height: 100%;
            }

            .row {
                display: flex;
                flex-direction: row;
            }

            .column {
                display: flex;
                flex-direction: column;
            }

            .half {
                width: 50%;
            }

            .a-c {
                align-items: center;
            }

            .j-c {
                justify-content: center;
            }

            .match {
                padding: 0;
                height: 100%;
                width: 100%;
                color: white;
                font-size: 100px;
            }

            .hidden {
                display: none;
            }

        </style>
        <div id="scoreboard" class="match hidden">
            <div class="row j-c">
                {{scoreboard.time.hours}}:{{scoreboard.time.minutes}}:{{scoreboard.time.seconds}}
            </div>
            <div class="row">   
                <div class="column half a-c">
                    <div>{{homeScore}}</div>
                    <div>{{scoreboard.homeTeam.name}}</div>
                </div>
                <div class="column half a-c">
                    <div>{{guestScore}}</div> 
                    <div>{{scoreboard.guestTeam.name}}</div>
                </div>
            </div>
         
        </div>
        `;
    }

    static get properties() {
        return {
            scoreboard: {
                type: Object,
                notify: true,
                observer: '_iceHockeyMatchChanged',
                value: new IceHockeyMatch()
            },

            homeScore: {
                type: Number,
                notify: true,
            },

            guestScore: {
                type: Number,
                notify: true,
            },
        };
    }

    ready() {
        super.ready();

        require('electron').ipcRenderer.on('data-scoreboard', this._updateTimer.bind(this))
    }

    /**
     * @param newValue
     */
     _iceHockeyMatchChanged(newValue) {
        if (!newValue) {
            return;
        }

        this.homeScore = newValue.homeScores.length;
        this.guestScore = newValue.guestScores.length;
        this.$.scoreboard.classList.remove('hidden');
    }

    /**
     * 
     * @param {*} evt 
     * @param {Object} data 
     */
    _updateTimer(evt, data) {
        this.scoreboard = data.match;
    }

    /**
     *
     */
    createMockData() { }
}

window.customElements.define('wc-resource-ice-hockey-scoreboard', WcResourceIceHockeyScoreboard);
