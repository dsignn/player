import {PolymerElement, html} from '@polymer/polymer/polymer-element'

/**
 *
 */
class WcResourceTest extends PolymerElement {

    static get template() {
        return html`
            <style>
                div {
                    font-size: 50px;
                    color: green;
                }
            </style>
            <div>{{test1.name}}</div>
            <div>{{test2.name}}</div>
        `;
    }

    static get properties () {
        return {

            test: {
                type: String
            }
        }
    }

    /**
     *
     */
    createMockData() {
        this.test1 = {
            name: 'Test1'
        };
        this.test2 = {
            name: 'Test2'
        }
    }
}


window.customElements.define('wc-resource-test', WcResourceTest);
