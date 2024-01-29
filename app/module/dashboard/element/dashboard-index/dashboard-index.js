import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {StorageListMixin} from "@dsign/polymer-mixin/storage/list-mixin";
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-grid/paper-grid';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-input/paper-input';
import './../paper-widget/paper-widget';
import {lang} from './language';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';

/**
 * @customElement
 * @polymer
 */
class DashboardIndex extends StorageListMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                
                paper-card.header div.data {
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
                
                paper-button#addButton {
                    height: 60px;
                    background-color: var(--accent-color);
                }
                
                paper-button#addButton[disabled] {
                    background-color: transparent;
                }
                           
                .button-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
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
                    on-autocomplete-reset-blur="_clearWidget"
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
                <div id="dataContainer" class="data"></div>
                <div class="button-container">
                    <paper-button id="addButton" disabled on-tap="addWidget">{{localize('add')}}</paper-button>
                </div>
        
            </paper-card>
            <paper-grid id="grid" 
                cell-height="1"
                cell-width="1"
                cell-margin="1" 
                col-count="400" 
                row-count="1000" 
                on-resize="_udpate" 
                on-move="_udpate"
                row-autogrow 
                col-autogrow 
                draggable 
                resizable 
                animated 
                overlappable 
                auto-adjustment>
            </paper-grid>`;
    }

    static get properties () {
        return {

            services : {
                value : {
                    _application: "Application",
                    _notify : "Notify",
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _storage: "WidgetStorage"
                    }
                }
            },

            /**
             * @type Application
             */
            _application: {
                type: Object,
                readOnly: true
            },

            /**
             * @type any
             */
            _notify: {
                type: Object,
                readOnly: true
            },

            /**
             * @type StorageInterface
             */
            _widgetStorage: {
                type: Object,
                readOnly: true
            }
        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();
    }

    /**
     * @param {StorageInterface} widgetStorage
     * @private
     */
    _changedStorage(widgetStorage) {
        super._changedStorage(widgetStorage);

        widgetStorage.getAll()
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
        // TODO cotroll papar autocomplete
        if (!this._application || !evt.detail.value) {
            return;
        }

        let widgets = this._application.getWidgets();

        let filter = widgets.filter(
            element => {
                return element.name.search(new RegExp(evt.detail.value.text, 'i')) > -1;
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

        this.removeDataWidget();

        let dataComponent = evt.detail.value.getWebComponentData();
        if(!dataComponent) {
            this._enableAddButton();
            return;
        }

        let element = document.createElement(dataComponent.getName());
        element.addEventListener('ready-data', this._enableAddButton.bind(this));
        element.addEventListener('unready-data', this._disableAddButton.bind(this));
        element.setAttribute('id', 'dataComponent');
        element.label = this.localize('widget-data-label');
        this.$.dataContainer.appendChild(element);
    }

    /**
     * @param evt
     * @private
     */
    _clearWidget(evt) {
        this.removeDataWidget();
    }

    /**
     *
     */
    removeDataWidget() {
        while (this.$.dataContainer.firstChild) {
            this.$.dataContainer.removeChild(this.$.dataContainer.firstChild);
        }
    }

    /**
     * @param evt
     * @private
     */
    _disableAddButton(evt) {
        this.$.addButton.disabled = true;
    }

    /**
     * @param evt
     * @private
     */
    _enableAddButton(evt) {
        this.$.addButton.disabled = false;
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
        widget.wc = this.$.widgetAutocomplete.value.getWebComponent().getName();
        if(widget.data = this.shadowRoot.querySelector('#dataComponent')) { 
            widget.data = this.shadowRoot.querySelector('#dataComponent').getData();

        } else {
            widget.data = {};
        }
        
        this._storage
            .save(widget)
            .then((data) => {

                this.$.widgetAutocomplete.clear();
                this.$.addButton.disabled = false;
                this.removeDataWidget();
                this._notify.notify('insert-widget');
                this.appendWidget(data);
                this._disableAddButton();

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

        this._storage.delete(evt.target.getWidget())
            .then((data) => {
                this._notify.notify('delete-widget');
                target.remove();
            });
    }

    /**
     * @param evt
     * @private
     */
    _udpate(evt) {

        this._storage.update(evt.target.getWidget())
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
