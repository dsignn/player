import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";


import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dialog-scrollable/paper-dialog-scrollable';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import "../paper-ice-hockey-player/paper-ice-hockey-player";
import {lang} from './language';
import { IceHockeyMatchEntity } from '../../src/entity/IceHockeyMatchEntity';

/**
 * @customElement
 * @polymer
 */
class IceHockeyScoreboard extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style >
                .column {
                    @apply --layout-horizontal;
                }

                .j-between {
                    justify-content: space-between;
                }

                .j-center {
                    justify-content: center;
                }

                .content-wrapper {
                    font-size:24px;
                    width: 100%;
                }

                paper-ice-hockey-player {
                    margin-bottom:4px;
                }

                .score {
                    padding-left: 6px;
                }

                .title-name {
                    text-transform: capitalize;
                }
                
                .players {
                    flex-basis: 42%
                }

                .info {
                    flex-basis: 16%;
                    padding: 0 4px;
                }

                paper-item {
                   
                }
            </style>
            <div class="column j-between">
                <div class="column content-wrapper j-center">
                    <div class="title-name">{{match.homeTeam.name}}</div>
                    <div class="score">000</div>
                </div>
                <div class="column content-wrapper j-center">
                    <div class="title-name">{{match.guestTeam.name}}</div>
                    <div class="score">100</div>
                </div>
            </div>
            <div class="column">
                <div class="players">
                    <dom-repeat id="menu" items="{{match.homeTeam.players}}" as="player">
                        <template>
                            <paper-ice-hockey-player player="{{player}}" on-update="updatePlayerBtn" type="home"></paper-ice-hockey-player>
                        </template>
                    </dom-repeat>
                </div>  
                <div class="info">
                    <dom-repeat id="menu" items="{{match.periods}}" as="period">
                        <template>
                            <paper-item>{{period.name}}</paper-item>
                        </template>
                    </dom-repeat>
                </div>
                <div class="players">
                    <dom-repeat id="menu" items="{{match.guestTeam.players}}" as="player">
                        <template>
                            <paper-ice-hockey-player player="{{player}}" on-update="updatePlayerBtn" type="guest"></paper-ice-hockey-player>
                        </template>
                    </dom-repeat>
                </div>
            </div>`
    }
    
    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {


            /**
             * @type number
             */
             match: {
                type: Object,
                notify: true,
                value: new IceHockeyMatchEntity()

            },

             /**
             * @type object
             */
              services: {
                value: {
                    _notify: "Notify",
                    _localizeService: 'Localize',
                    "StorageContainerAggregate": {
                        _storage: "IceHockeyMatchStorage"
                    }
                }
            }
         
        }
    }

    connectedCallback() {
        super.connectedCallback();

        let ele = document.createElement('paper-dialog');
        this.idDialog = this.__randomString();
        ele.setAttribute('id', this.idDialog);
        ele.setAttribute('with-backdrop', '');

        let addPlayer = document.createElement('ice-hockey-add-player');
        ele.appendChild(addPlayer);

       // addPlayer.addEventListener('add', this.addPlayer.bind(this));
        addPlayer.addEventListener('update', this.updatePlayer.bind(this));

        document.body.appendChild(ele);
    }

        /**
     * 
     * @returns {string}
     */
         __randomString() {
            return Math.random().toString(16).substr(2, 8);
        }

    /**
     * @param {Event} evt 
     */
    updatePlayerBtn(evt) {
        let ele = document.getElementById(this.idDialog);
        ele.querySelector('ice-hockey-add-player').typeTeam = evt.target.getAttribute('type');
        ele.querySelector('ice-hockey-add-player').player = evt.detail;
        ele.open();
    }


    /**
     * @param {Event} evt 
     */
    updatePlayer(evt) {
        let ele = document.getElementById(this.idDialog);
        ele.close();

        let team = 'homeTeam';
        if (evt.target.typeTeam != 'home') {
            team = 'guestTeam';
        } 

        let index = this.match[team].players.findIndex((element) => {
            return element.id === evt.detail.player.id;
        });
     
        this.splice('match.' + team + '.players', index, 1, evt.detail.player );

        this._storage.update(this.match)
            .then((data) => {
                console.log('AGGIORNATO', data);
            });
    }
}
window.customElements.define('ice-hockey-scoreboard', IceHockeyScoreboard);

