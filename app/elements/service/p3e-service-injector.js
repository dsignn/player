import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * @customElement
 * @polymer
 */
export class P3EServiceInjectorElement extends PolymerElement {

    static get properties () {
        return {
            services: {
                type: String,
                reflectToAttribute: true
            }
        };
    }

    ready() {
        super.ready();
        if (this.services !== undefined) {
            //console.log('services', this.services);
        }
    }
}