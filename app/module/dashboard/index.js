import {html} from '@polymer/polymer/polymer-element.js';
import {DsignLocalizeElement} from "../../elements/localize/dsign-localize";
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {EntityPaginationBehavior} from "../../elements/storage/entity-pagination-behaviour";
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-grid/paper-grid';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-input/paper-input';
import {lang} from './language';
import {autocompleteStyle} from '../../style/autocomplete-custom-style';

/**
 * @customElement
 * @polymer
 */
class DashboardIndex extends mixinBehaviors([EntityPaginationBehavior], DsignLocalizeElement) {

    static get resizeEvent() {
        return [
            'top',
            'top-right',
            'top-left',
            'bottom',
            'bottom-right',
            'bottom-left',
            'left',
            'right',
        ];
    }

    static get template() {
        return html`
            <style>
                paper-card.header {
                    @apply --layout-horizontal;
                    padding: 8px;
                    margin-bottom: 8px;
                }
                
                paper-card.header paper-input,
                paper-card.header paper-autocomplete {
                    @apply  --layout-flex-auto;
                }
                 
                .hidden {
                    visibility: hidden;
                } 
                 
                paper-grid tile {
                    background: tomato;
                    opacity: 0.8;
                    color: white;
                    cursor: move;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
        
                paper-grid [placeholder] {
                    background: #afafaf;
                }
        
                paper-grid tile > span:not([resize]) {
                    flex: 1;
                    text-align: center;
                    font-size: 2em;
                }
        
                paper-grid [resize] {
                    position: absolute;
                }
        
                paper-grid [resize="bottom-right"] {
                    bottom: 0;
                    right: 0;
                    cursor: nwse-resize;
                }
        
                paper-grid [resize="bottom-left"] {
                    bottom: 0;
                    left: 0;
                    cursor: nesw-resize;
                }
        
                paper-grid [resize="top-right"] {
                    top: 0;
                    right: 0;
                    cursor: nesw-resize;
                }
        
                paper-grid [resize="top-left"] {
                    top: 0;
                    left: 0;
                    cursor: nwse-resize;
                }
        
                paper-grid [resize="left"] {
                    top: 50%;
                    left: 0;
                    cursor: ew-resize;
                    margin-top: -10px;
                }
        
                paper-grid [resize="top"] {
                    top: 0%;
                    width: 100%;
                    text-align: center;
                    cursor: ns-resize;
                }
        
                paper-grid [resize="right"] {
                    top: 50%;
                    right: 0;
                    cursor: ew-resize;
                    margin-top: -10px;
                }
        
                paper-grid [resize="bottom"] {
                    bottom: 0;
                    width: 100%;
                    text-align: center;
                    cursor: ns-resize;
                }
                
                .gutter {
                    height: 100%;
                    width: 8px;
                }
            </style>
            <paper-card class="header">
                <paper-autocomplete
                    id="widgetAutocomplete"
                    label="{{localize('widget')}}"
                    text-property="name"
                    value-property="name"
                    on-autocomplete-selected="_selectWidget"
                    on-autocomplete-change="_searchWidget"
                    remote-source>
                     <template slot="autocomplete-custom-template">
                        ${autocompleteStyle}
                        <paper-item class="account-item" on-tap="_onSelect" role="option" aria-selected="false">
                            <div index="[[index]]">
                                <div class="service-name">[[item.name]]</div>
                                <div class="service-description">[[item.description]]</div>
                            </div>
                            <paper-ripple></paper-ripple>
                        </paper-item>
                    </template>
                </paper-autocomplete>
                <div class="gutter"></div>
                <paper-input id="data" label="{{localize('data')}}" class="hidden" on-value-changed="changeData"></paper-input>
                <paper-button id="addButton" disabled on-tap="addWidget">{{localize('add')}}</paper-button>
            </paper-card>
            <paper-grid id="grid" col-count="4" row-count="10" cell-margin="6" on-resize="_udpate" on-move="_udpate" row-autogrow col-autogrow draggable resizable animated overlappable>
            </paper-grid>
        `;
    }

    static get properties () {
        return {

            services : {
                value : {
                    application: "Application",
                    notify : "Notify",
                    storageContainerAggregate: 'StorageContainerAggregate'
                }
            },

            storageService : {
                value: 'WidgetStorage'
            }
        };
    }

    static get observers() {
        return [
            'observerStorage(storageContainerAggregate, storageService)',
            'observerStorageService(storage)'
        ]
    }

    constructor() {
        super();
        this.resources = lang;
    }

    /**
     * @param storage
     */
    observerStorageService(storage) {

        storage.getAll()
            .then((data) => {

                for (let cont = 0; data.length > cont; cont++) {
                    this.appendWidget(data[cont]);
                }
            });
    }

    /**
     * @param evt
     * @private
     */
    _searchWidget(evt) {
        let widgets = this.application.getWidgets();

        let filter = widgets.filter(
            element => {
                return element.name.search(new RegExp(evt.detail.value, 'i')) > -1;
            }
        );

        evt.detail.target.suggestions(
            filter
        );
    }

    /**
     * @param evt
     * @private
     */
    _selectWidget(evt) {
        this.$.data.classList.remove("hidden");
    }

    /**
     * @param evt
     */
    changeData(evt) {

        if (!evt.target.value) {
            this.$.addButton.disabled = true;
            return;
        }

        this.$.addButton.disabled = false;
    }

    /**
     * @param evt
     */
    addWidget(evt) {

        let widget = new WidgetEntity();
        widget.wc = this.$.widgetAutocomplete.value.wc;
        widget.data =  this.$.data.value.trim().split(" ");

        this.storage
            .save(widget)
            .then((data) => {

                this.$.data.classList.add("hidden");
                this.$.widgetAutocomplete.clear();
                this.$.data.value = '';
                this.$.addButton.disabled = false;
                this.notify.notify('insert-widget');
                this.appendWidget(data);

            })
            .catch((err) => {
                    console.log(err)
                }
            );
    }

    /**
     * @param {WidgetEntity} widget
     */
    appendWidget(widget) {

        let widgetElem = document.createElement('paper-widget');
        widgetElem.initFromWidget(widget);
        widgetElem.addEventListener('remove', this._removeWidget.bind(this));
        this._initSpanResizeWidget(widgetElem);
        this.$.grid.appendChild(widgetElem);
    }

    /**
     * @param evt
     * @private
     */
    _removeWidget(evt) {

        let target = evt.target;

        this.storage.delete(evt.target.getWidget())
            .then((data) => {
                this.notify.notify('delete-widget');
                target.remove();
            });
    }

    /**
     * @param evt
     * @private
     */
    _udpate(evt) {

        this.storage.update(evt.target.getWidget())
            .then((data) => {

            });
    }

    /**
     * @param widget
     * @private
     */
    _initSpanResizeWidget(widget) {

        let resizes = DashboardIndex.resizeEvent;
        for (let cont = 0; resizes.length > cont; cont++) {
            let span = document.createElement('span');
            span.setAttribute('slot', resizes[cont]);
            span.setAttribute('resize', resizes[cont]);
            switch (resizes[cont]) {
                case "top":
                case "bottom":
                    span.innerHTML = '─';
                    break;
                case "right":
                case "left":
                    span.innerHTML = '│';
                    break;
                case "top-right":
                    span.innerHTML = '┐';
                    break;
                case "top-left":
                    span.innerHTML = '┌';
                    break;
                case "bottom-right":
                    span.innerHTML = '┘';
                    break;
                case "bottom-left":
                    span.innerHTML = '└';
                    break;

            }

            widget.appendChild(span);
        }
    }
}
window.customElements.define('dashboard-index', DashboardIndex);
