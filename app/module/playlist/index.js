import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../elements/localize/dsign-localize";
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tabs/paper-tabs';
import {flexStyle} from '../../style/layout-style';
import {lang} from './language';
/**
 * @customElement
 * @polymer
 */
class PlaylistIndex extends DsignLocalizeElement {

    static get template() {
        return html`
            ${flexStyle} 
            <style>
                div.header {
                    @apply --header-view-list;
                }
                
                paper-tabs {
                    margin-bottom: 8px;
                    max-width: 450px;
                }
            
                paper-icon-button.circle {
                    @apply --paper-icon-button-action;
                }
                
                .topology {
                    position: relative;
                }
            </style>
                <iron-pages id="index" selected="{{selected}}">
                    <div id="list"> 
                       lista
                    </div>
                    <div id="insert"> 
                       insert
                    </div>
                    <div id="update"> 
                      update
                    </div>
                </iron-pages>          
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {
            selectedTad: {
                value: 0
            },

            selected: {
                type: Number,
                value: 0
            }
        };
    }

    /**
     * @param evt
     */
    displayAddView(evt) {
        this.selected = 1;
    }

    /**
     * @param evt
     */
    displayListView(evt) {
        this.selected = 0;
    }
}
window.customElements.define('playlist-index', PlaylistIndex);
