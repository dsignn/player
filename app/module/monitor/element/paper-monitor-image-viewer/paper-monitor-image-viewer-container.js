import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';


/**
 * @customElement
 * @polymer
 */
class PaperMonitorImageViewerContainer extends PolymerElement {

    static get template() {
        return html`
            <style >   
                
                :host {
                    display: block !important;
                }
                
                #container {
                    position: relative;
                    overflow: scroll;
                }

            </style>
            <div id="container">
                <slot></slot>
            </div>
        `
    }

    constructor() {
        super();


        this.resizeImageContainer();
        window.addEventListener("resize", this.resizeImageContainer.bind(this));
    }

    resizeImageContainer(evt) {
        let dataContainer = this.getBoundingClientRect();
        let dataBody = document.body.getBoundingClientRect();

        if (dataBody.height && dataContainer.top) {
            let calcHeight = dataBody.height - dataContainer.top - 10;        
            this.$.container.style.height = calcHeight + 'px';
        }
    }
}
window.customElements.define('paper-monitor-image-viewer-container', PaperMonitorImageViewerContainer);