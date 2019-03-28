import {html} from '@polymer/polymer/polymer-element.js';
import {P3ELocalizeElement} from '../localize/p3e-localize';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/app-layout/app-header/app-header.js'
import '@polymer/app-layout/app-drawer/app-drawer.js'
import '@polymer/iron-icons/iron-icons';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button.js'
import '@polymer/paper-tooltip/paper-tooltip.js'
import '../localize/select/p3e-select-language.js'
import { flexStyle } from '../../style/layout-style'
import {lang} from './language/language.js';
/**
 * @customElement
 * @polymer
 */
class P3ELayout extends P3ELocalizeElement {

    static get template() {
        return html`
             ${flexStyle}
             <style>
          
                 app-toolbar {
                    @apply --app-toolbar;
                 }
                 
                 app-drawer .avatar-image {
                    height: 256px;
                    padding: 0 8px;
                 }
                
                app-drawer .avatar-image iron-icon {
                    --iron-icon-width : 240px;
                    --iron-icon-height : 256px;
                }
                
                app-drawer .avatar-name {
                    font-style: italic;
                    font-size: 20px;
                    padding: 0 8px;
                    text-align: center;
                    color: var(--secondary-text-color);
                }
                
                paper-tooltip {
                    --paper-tooltip : {
                        font-size: 18px;
                    }
                }
           
             </style>
             <app-header-layout fullbleed>
                <app-header reveals>
                    <app-toolbar>
                        <div main-title>{{localize('nameApp')}}</div>
                        <p3e-select-language></p3e-select-language>
                        <paper-icon-button id="buttonDrawer" icon="icons:account-circle" on-click="_tapDrawer"></paper-icon-button>
                    </app-toolbar>
                </app-header>
                <div class="layout-container layout-horizontal">
                    <div class="layout-vertical layout-center-aligned layout-menu">
                        <dom-repeat id="menu" items="{{modules}}" as="module">
                            <template>
                                <paper-icon-button id="{{module.name}}" icon="{{module.icon}}" on-tap="_tapMenu"></paper-icon-button>
                                <paper-tooltip for="{{module.name}}" position="right" animation-delay="400" animation-entry="scale-up-animation">{{module.name}}</paper-tooltip>
                            </template>
                        </dom-repeat>
                    </div>
                    <div class="layout-vertical layout-flex-auto layout-content">
                        <iron-pages id="pages" selected="{{section}}" attr-for-selected="name">

                        </iron-pages>
                    </div>
                </div>
            </app-header-layout>
            <app-drawer id="settingDrawer" align="right" swipe-open>
                <div class="avatar-image">
                    <iron-icon icon="icons:account-circle"></iron-icon>
                </div>
                <div class="avatar-name">Mario rossi</div>
            </app-drawer>
        `;
    }

    static get properties() {
        return {

            section: {
                type: String,
                notify: true,
                value: 'home'
            },

            modules: {
                type: Array,
                notify: true,
                observer: 'changeModules'
            },
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();

        if (window.container) {
            this.modules = window.container.get('Application').getModules();
        }
    }

    /**
     * @param evt
     * @private
     */
    _tapDrawer(evt) {
        this.$.settingDrawer.open();
    }

    _tapMenu(evt) {
        this.section = evt.target.id;
    }

    /**
     * Observe modules change
     *
     * @param newValue
     * @param oldValue
     */
    changeModules(newValue, oldValue) {
        if (!newValue) {
            return;
        }

        for (let cont = 0; this.modules.length > cont; cont++) {
            let elem = document.createElement(this.modules[cont].getWebComponentEntryPointName());
            elem.name = this.modules[cont].getName();
            this.$.pages.appendChild(elem);
        }
    }
}

window.customElements.define('p3e-layout', P3ELayout);
