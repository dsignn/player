import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";

export class PaperWidget extends DsignLocalizeElement {

    static get template() {
        return html`
            <style>
                :host {
                    border-radius: 2px;
                    box-sizing: border-box;
                    background-color: #FFFFFF;
                    overflow: hidden;
                     @apply --shadow-elevation-2dp;
                }
    
                .container {
                    height: 100%;
                }
    
                .header {
                    height: 60px;
                    background-color: var(--primary-background-color);
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                    font-size: 20px;
                }
    
                .header .sub-title {
                    font-style: italic;
                    padding-left: 8px;
                    color: #3c3c3c;
                }
    
                .content {
                    padding: 8px 4px;
                    width: 100%;
                    height: 82%;
                    cursor: move;
                    overflow-y: auto;
                    overflow-x: hidden;
                    font-size: 18px;
                }
    
                .header .data {
                    display: flex;
                    justify-content: center;
                    flex: 1;
                }
    
                .overlay {
                    position: absolute;
                    height: 100%;
                    width: 100%;
                }
    
                div.overlay ::slotted([resize]) {
                    font-size: 20px;
                    color: transparent;
                }
    
                div.overlay ::slotted([resize]:hover) {
                    color: black;
                }
    
                .move {
                    cursor: move;
                }
    
                div.overlay ::slotted([slot=top-left]),
                div.overlay ::slotted([slot=top-right]),
                div.overlay ::slotted([slot=top])
                {
                    line-height: 10px;
                }
    
    
                div.overlay ::slotted([slot=bottom-left]),
                div.overlay ::slotted([slot=bottom-right]),
                div.overlay ::slotted([slot=bottom])
                {
                    line-height: 12px;
                }
    
                .remove {
                    position: absolute;
                    top: 0;
                    right: 0;
                }
            </style>
    
            <div class="container">
                <div class="overlay">
                    <slot name="top"></slot>
                    <slot name="top-right"></slot>
                    <slot name="top-left"></slot>
                    <slot name="bottom"></slot>
                    <slot name="bottom-right"></slot>
                    <slot name="bottom-left"></slot>
                    <slot name="left"></slot>
                    <slot name="right"></slot>
                </div>
                <div class="header">
                    <div class="data">
                        {{title}}: <span class="sub-title">{{subTitle}}</span>
                    </div>
                    <div class="action">
                        <paper-menu-button ignore-select style="padding: 0">
                            <paper-icon-button icon="v-menu" slot="dropdown-trigger" alt="multi menu"></paper-icon-button>
                            <paper-listbox slot="dropdown-content" class="auto" multi>
                                <paper-item item="{{videoPanel}}" on-tap="_remove">Elimina</paper-item>
                            </paper-listbox>
                        </paper-menu-button>
                    </div>
    
                </div>
                <div id="content" class="content"></div>
            </div>
        `;
    }

    static get properties () {
        return {

            id: {
                type: String
            },

            wc: {
                type: String,
                notify: true,
                observer: "_changedWc"
            },

            data: {
                type: Object,
                notify: true,
                value: {}
            },

            col: {
                type: Number,
                notify: true,
                reflectToAttribute: true
            },

            row: {
                type: Number,
                notify: true,
                reflectToAttribute: true,
            },

            height: {
                type: Number,
                notify: true,
                reflectToAttribute: true,
                value: 3
            },

            width: {
                type: Number,
                notify: true,
                reflectToAttribute: true,
                value: 3
            }
        };
    }


    /**
     * @param newValue
     * @param oldValue
     */
    _changedWc(newValue, oldValue) {

        if (!newValue || newValue == oldValue) {
            return;
        }



        let elem = document.createElement('paper-timeslot-tags');
        elem.data = this.data;
        elem.classList.add("move");

      //  this.title = elem.getTitle();
      //  this.subTitle = elem.getSubTitle();
        setTimeout(
            () => {
                this.title = elem.getTitle();
                this.subTitle = elem.getSubTitle();
            },
            500
        );

        this.$.content.appendChild(elem);
    }

    /**
     * @return {WidgetEntity}
     */
    getWidget() {
        let widget = new Widget();

        widget.id = this.id;
        widget.width = this.width;
        widget.height = this.height;
        widget.row = this.row;
        widget.col = this.col;
        widget.wc = this.wc;
        widget.data = this.data;

        return widget;
    }

    /**
     * @param {WidgetEntity} widget
     */
    initFromWidget(widget) {

        this.id = widget.id;
        this.width = widget.width;
        this.height = widget.height;
        this.row = widget.row;
        this.col = widget.col;
        this.wc = widget.wc;
        this.data = widget.data;
    }

    /**
     *
     */
    _remove() {
        this.dispatchEvent(new CustomEvent('remove'));
    }
}

window.customElements.define('paper-widget', PaperWidget);
