import {Listener} from '@dsign/library/src/event/Listener';
import {Application}  from '@dsign/library/src/core/Application';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "../mixin/service/injector-mixin";
import {LocalizeMixin} from "../mixin/localize/localize-mixin";
import {AclMixin} from "../mixin/acl/acl-mixin";
import '@polymer/app-layout/app-header-layout/app-header-layout';
import '@polymer/app-layout/app-toolbar/app-toolbar';
import '@polymer/app-layout/app-header/app-header';
import '@polymer/app-layout/app-drawer/app-drawer';
import '@polymer/app-layout/app-scroll-effects/effects/waterfall';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '../icons/icons';
import '../paper-select-language/paper-select-language';
import '../paper-backup/paper-backup';
import '../paper-restore/paper-restore';
import '../paper-always-on-top/paper-always-on-top';
import '../paper-gpu-setting/paper-gpu-setting';
import { flexStyle } from '../../style/layout-style';
import {lang} from './language/language.js';

/**
 * @customElement
 * @polymer
 */
class ApplicationLayout extends AclMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

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
                     background-color: var(--dark-primary-color);
                        background:  var(--dark-primary-color);
                        font-size: 18px;
                    }
                }
                
                paper-icon-button.menu {
                    @apply --paper-icon-button-menu;
                }
                
                .layout-menu {
                    background-color:  #FFFFFF;
                }
                  
                #menuContent {
                    height: 100%;
                    display: block;
                }
                
                #menuContent > div {
                    position: fixed;
                    flex-direction: column;
                    display: flex;
                    height: 100%;
                    background-color: white;
                }
                          
             </style>
             <app-header-layout>
                <app-header slot="header" fixed condenses effects="waterfall">
                    <app-toolbar>
                        <div main-title>{{localize('nameApp')}}</div>
                        <template is="dom-if" if="[[isAllowed('Post')]]">
                            test
                        </template>
                        <paper-select-language></paper-select-language>
                        <paper-gpu-setting></paper-gpu-setting>
                        <paper-backup></paper-backup>
                        <paper-restore></paper-restore>
                        <paper-always-on-top></paper-always-on-top>
                        <paper-icon-button id="buttonDrawer" icon="user" on-click="_tapDrawer"></paper-icon-button>
                    </app-toolbar>
                </app-header>
                <div class="layout-container layout-horizontal">
                    <div id="menuContent" class="layout-vertical layout-center-aligned layout-menu">
                        <div>
                            <dom-repeat id="menu" items="{{modules}}" as="module">
                                <template>
                                    <paper-icon-button id="{{module.name}}" class="menu" icon="{{module.icon}}" on-tap="_tapMenu"></paper-icon-button>
                                    <paper-tooltip for="{{module.name}}" position="right">{{module.title}}</paper-tooltip>
                                </template>
                            </dom-repeat>
                        </div>
                    </div>
                    <div class="layout-vertical layout-flex-auto layout-content">
                        <iron-pages id="pages" selected="{{section}}" attr-for-selected="name"></iron-pages>
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
                value : 'playlist'
            },

            modules: {
                type: Array,
                notify: true,
                observer: 'changeModules'
            },

            services : {
                value : {
                    application:  "Application",
                    _aclService: 'Acl',
                    _localizeService: 'Localize'
                }
            },

            application :  {
                observer: 'changeApplicationService'
            }
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    connectedCallback() {
        super.connectedCallback();
    }

    /**
     * @param newValue
     */
    changeApplicationService(newValue) {
        if (!newValue) {
            return;
        }

        this.modules = newValue.getModules();

        if (this.modules.length === 0) {
            newValue.getEventManager().on(
                Application.BOOTSTRAP_MODULE,
                new Listener(this.loadModules.bind(this))
            );
        }
    }

    /**
     * @param evt
     */
    loadModules(evt) {
        this.modules = evt.data;
    }

    /**
     * @param evt
     * @private
     */
    _tapDrawer(evt) {
        this.$.settingDrawer.open();
    }

    /**
     * @param evt
     * @private
     */
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
            let elem = document.createElement(this.modules[cont].getEntryPoint().getName());
            elem.name = this.modules[cont].getName();
            this.$.pages.appendChild(elem);
        }
    }
}

window.customElements.define('application-layout', ApplicationLayout);
