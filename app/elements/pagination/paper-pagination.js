import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/neon-animation/neon-animation';

export class PaperPagination extends PolymerElement {

    static get template() {
        return html`
            <style >
                :host {
                    display: block;
                }
    
                .flex {
                    @apply --layout;
                }
    
                .flex-horizontal {
                    @apply --layout-horizontal;
                }
    
                .flex-vertical {
                    @apply --layout-vertical;
                }
    
                .flex-end-justified {
                    @apply --layout-end-justified;
                }
    
                paper-dropdown-menu {
                    width: 50px;
                }
    
                paper-listbox {
                    min-width: 60px;
                }
    
                paper-button {
                    height: 30px;
                    width: 30px !important;
                    min-width: 30px !important;
                    border-radius: 50%;
                    margin: 0.29em;
                    font-weight: 600;
                    font-family: "Open Sans";
                }
    
                paper-dropdown-menu {
    
                    top: -20px;
                }
    
                .selected {
                    background-color: var(--dark-primary-color);
                    color: var(--text-primary-color);
                }
    
            </style>
            <div hidden$="[[hide]]">
                <div id="container" class="flex flex-end-justified"></div>
            </div>
               
        `
    }

    /**
     * Properties
     */
    static get properties() {
        return {

            page: {
                type: Number,
                value: 1,
                notify: true,
            },

            totalItems: {
                type: Number
            },

            itemPerPage: {
                type:Number,
                notify: true,
                observer: '_changeItemPerPage'
            },

            numberPages: {
                type: Number,
                readOnly: true,
            },

            listNumberPerPage: {
                type: Array,
                value: [
                    5,
                    10,
                    20,
                    30,
                    40,
                    50
                ]
            },

            nextIcon: {
                type: String,
            },

            previousIcon: {
                type: String,
            }
        }
    }

    static get observers() {
        return [
            '_render(page, totalItems, itemPerPage)'
        ]
    }

    /**
     * @return {boolean}
     */
    _hide() {
        return this.totalItems <= this.itemPerPage;
    }

    /**
     * @param newValue
     * @private
     */
    _changeItemPerPage(newValue) {
        if (!newValue) {
            return;
        }

        let find = this.listNumberPerPage.find(
            (itemPerPage) => {
                return itemPerPage === newValue
        });

        if (!find) {
            this.listNumberPerPage.push(newValue);
            this.listNumberPerPage.sort((prev , next) => {
                return prev - next;
            });
            this._render(this.page, this.totalItem, this.itemPerPage);
        }
    }

    /**
     * @param {Number} page
     * @param {Number} totalItem
     * @param {Number} itemPerPage
     * @private
     */
    _render(page, totalItem, itemPerPage) {
        this.hide = this._hide();
        if (typeof page !== 'number' || typeof totalItem !== 'number' || typeof itemPerPage !== 'number' || this.hide) {
            return;
        }

        this._setNumberPages(Math.ceil(totalItem / itemPerPage));

        this._clear();
        if (this.numberPages < 2) {
            if (totalItem > 0) {
                this.$.container.appendChild(this._createNumberItemsElement());
            }
            return;
        }

        let element;

        if (this.nextIcon) {
            this.$.container.appendChild(this._createPreviousElement());
        }

        for (let count = 1; count <= this.numberPages;  count++) {
            element = document.createElement('paper-button');
            element.textContent = count;
            element.page = count;
            if (count === page) {
                element.disabled = true;
                element.classList.add("selected");
            }
            element.addEventListener('click', this.clickPage.bind(this));
            this.$.container.appendChild(element);
        }

        if (this.nextIcon) {
            this.$.container.appendChild(this._createNextElement());
        }
        this.$.container.appendChild(this._createNumberItemsElement());
    }

    /**
     * @private
     */
    _createPreviousElement() {
        let element = document.createElement('paper-icon-button');
        element.icon = this.previousIcon;
        if (this.page > 1) {
            element.addEventListener('click', this.clickPreviousPage.bind(this));
        } else {
            element.disabled = true;
        }
        return element;
    }

    /**
     * @private
     */
    _createNextElement() {
        let element = document.createElement('paper-icon-button');
        element.icon = this.nextIcon;
        if (this.numberPages <= this.page) {
            element.disabled = true;
        } else {
            element.addEventListener('click', this.clickNextPage.bind(this));
        }
        return element;
    }

    /**
     * @private
     */
    _createNumberItemsElement() {
        let element = document.createElement('paper-dropdown-menu');
        element.addEventListener('iron-select', this.clickItemPerPage.bind(this));
        let paperBox = document.createElement('paper-listbox');
        paperBox.slot = "dropdown-content";
        for (let cont = 0; this.listNumberPerPage.length > cont; cont++) {
            if (this.itemPerPage === this.listNumberPerPage[cont]) {
                paperBox.selected = cont;
            }
            let paperItem = document.createElement('paper-item');
            paperItem.textContent = this.listNumberPerPage[cont];
            paperBox.appendChild(paperItem);
        }
        element.appendChild(paperBox);
        return element;
    }

    /**
     * @private
     */
    _clear() {

        while (this.$.container.hasChildNodes()) {
            this.$.container.removeChild(this.$.container.lastChild);
        }
    }

    /**
     * @param evt
     */
    clickPage(evt) {
        this.page = evt.target.page;
    }

    /**
     *
     */
    clickPreviousPage() {
        if (this.page < 2) {
            return;
        }
        this.page--;
    }

    /**
     *
     */
    clickNextPage() {
        if (this.numberPages <= this.page) {
            return;
        }
        this.page++;
    }

    /**
     * @param evt
     */
    clickItemPerPage(evt) {
        this.itemPerPage = parseInt(evt.detail.item.textContent);
    }
}

window.customElements.define('paper-pagination', PaperPagination);