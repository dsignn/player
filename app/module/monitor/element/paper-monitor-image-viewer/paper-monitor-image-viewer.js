import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import '@polymer/paper-card/paper-card';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-toggle-button/paper-toggle-button';
import '@fluidnext-polymer/paper-input-color/paper-input-color'
import '@fluidnext-polymer/paper-input-color/icons/paper-input-color-icons'
import '../../../../elements/paper-input-points/paper-input-points';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language';

/**
 * @customElement
 * @polymer
 */
class PaperMonitorImageViewer extends LocalizeMixin(ServiceInjectorMixin(PolymerElement)) {

    static get template() {
        return html`
            ${flexStyle}
            <style >
                :host {
                    display: block;
                }
                
                #scroll-container {
                    overflow-x: auto;
                    overflow-y: hidden;
                    display: block;
                    border: none 0px RED;
                   
                }

                #scroll {
                    height: 20px;
                }
              
            </style>
            <div id="scroll-container">
                <div id="scroll"></div>
            </div>
            <div id="container">
            </div>
        `
    }

    constructor() {
        super();
        this.resources = lang;
    }


    static get properties () {
        return {

            /**
             * @object
             */
            services : {
                value : {
                    _localizeService: 'Localize',
                    StorageContainerAggregate: {
                        _resourceStorage: "ResourceStorage"
                    },
                    EntityContainerAggregate: {
                        _entityReference : "EntityReference"
                    }
                }
            },



            /**
             * @type object
             */
            monitor: {
                observer: '_changMonitor',
            },
        };
    }

    _changMonitor(newValue) {
        if (!newValue) {
            return;
        }

        this.$.container.style.background =  'red';

        this.$.container.style.height =  newValue.height + 'px';
        this.$.container.style.width =  newValue.width + 'px';
    
        this.$.scroll.style.width =  newValue.width + 'px';
    }
}
window.customElements.define('paper-monitor-image-viewer', PaperMonitorImageViewer);