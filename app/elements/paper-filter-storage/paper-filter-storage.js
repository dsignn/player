import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";

/**
 * @class PaperFilterStorage
 */
export class PaperFilterStorage extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            <style>

                :host {
                    display: block;
                }

                paper-card {
                    height: 100%;
                    width: 100%;
                    @apply --paper-filter-storage;
                }
  
            </style>

            <paper-card>
                <slot name="filters"></slot>
            </paper-card>
        `
    }

    static get properties() {
        return {

            services : {
                value : { }
            },

            filters: {
                notify: true,
                value: { }
            },

            inputFilters: {
                value: []
            }
        }
    }

    /**
     * @inheritDoc
     */
    connectedCallback () {
        super.connectedCallback();

        let filterNodes = this.querySelector('[slot="filters"]').childNodes;
        filterNodes.forEach(element => {
            if (this._isInputFilter(element)) {
                this.inputFilters.push(element);

                switch (true) {
                    case element.tagName === 'PAPER-INPUT':
                        setTimeout(() => {
                                element.addEventListener("value-changed", this._valueChanged.bind(this));
                            }, 
                            1000
                        );
                        
                        break;
                    case element.tagName === 'PAPER-INPUT-LIST':
                        setTimeout(() => {
                                element.addEventListener("list-value-changed", this._valueChanged.bind(this));
                            }, 
                            1000
                        );
                        
                        break;
                    case element.tagName === 'PAPER-DROPDOWN-MENU':
                        setTimeout(() => {
                                element.addEventListener("iron-select", this._selectChange.bind(this));
                                element.addEventListener("iron-deselect", this._deselectChange.bind(this));
                            }, 
                            1000
                        );       
                        break;
                }
            }
        });
    }

    /**
     * @param {Event} evt 
     */
    _valueChanged(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();
       
        switch(true) {
    
            case evt.target.getAttribute('direction') !== null:
                this.filters[evt.target.name] = {
                    'direction':  evt.target.getAttribute('direction'), 
                    'value': parseInt(evt.target.value)
                }
                break;
            case Array.isArray(evt.detail.value) && evt.detail.value.length > 0:
                this.filters[evt.target.name] = evt.detail.value
                break;
            case !!evt.detail.value && !Array.isArray(evt.detail.value):
                this.filters[evt.target.name] = evt.detail.value
                break;
            default:
                delete this.filters[evt.target.name];
        }
        
      
        let event = new CustomEvent('value-changed', {detail: this.filters});
        this.dispatchEvent(event);
    }

    /**
     * @param {Event} evt 
     */
    _selectChange(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();

        this.filters[evt.target.parentElement.name] = evt.detail.item.value;
        this._dispatch();
    }

    _dispatch() {
        let event = new CustomEvent('value-changed', {detail: this.filters});
        this.dispatchEvent(event);
    }

    /**
     * @param {Event} evt 
     */
    _deselectChange(evt) {
        evt.preventDefault();
        evt.stopImmediatePropagation();

        delete this.filters[evt.target.parentElement.name];

        let event = new CustomEvent('value-changed', {detail: this.filters});
        this.dispatchEvent(event);
    }

    _isInputFilter (node) {
        return !node.disabled && !!node.name;
    }
}

window.customElements.define('paper-filter-storage', PaperFilterStorage);
