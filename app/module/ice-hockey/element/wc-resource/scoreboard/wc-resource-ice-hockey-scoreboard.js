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
            <div>{{scoreboard.homeTeam.name}}</div>
            <div>{{homeScore}}</div>
            <div>{{guestScore}}</div>
            <div>{{scoreboard.guestTeam.name}}</div> 
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
