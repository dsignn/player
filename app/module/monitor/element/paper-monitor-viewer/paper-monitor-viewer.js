import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 *
 */
export class PaperMonitorViewer extends PolymerElement {

    static get template() {
        return html`
             <style>
                :host {
                    display: block;
                    position: absolute;
                }
        
                .info {
                    padding: 8px 16px 8px 16px;
                    right: 0;
                    bottom: 0;
                }
            </style>
            <div class="info">Heigh {{height}} px</div>
            <div class="info">Width {{width}} px</div>
            <div class="info">Top {{top}} px</div>
            <div class="info">Left {{left}} px</div>  
             `
    };

    static get properties() {
        return {
            height: {
                type: Number,
            },

            width: {
                type: Number,
            },

            top: {
                type: Number,
            },

            left: {
                type: Number,
            },

            zoom: {
                type: Number,
                value: 5
            }
        }
    }

    ready() {
        super.ready();
        if (!this.bgColor) {
            this.bgColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this._computeData();
    }

    /**
     * @private
     */
    _computeData() {

        this.style.backgroundColor = this.bgColor;
        this.style.height = this.height / this.zoom + 'px';
        this.style.width = this.width / this.zoom + 'px';
        this.style.top = this.top / this.zoom + 'px';
        this.style.left = this.left / this.zoom + 'px';
    }
}

window.customElements.define('paper-monitor-viewer', PaperMonitorViewer);

