import {Listener} from '@dsign/library/src/event/Listener';
import {Application} from '@dsign/library/src/core/Application';
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {AclMixin} from "@dsign/polymer-mixin/acl/acl-mixin";
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
//import '../paper-backup/paper-backup';
//import '../paper-restore/paper-restore';
//import '../paper-always-on-top/paper-always-on-top';
//import '../paper-gpu-setting/paper-gpu-setting';
import '../paper-info/paper-info';
import '../paper-auth/paper-auth';
import {flexStyle} from '../../style/layout-style';
import {lang} from './language.js';

/**
 * @customElement
 * @polymer
 */
class ApplicationLayout extends AclMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement))) {

    static get template() {
        return html`
             ${flexStyle}
             <style>
                :host {
                    display: block;
                    height: 100%;
                    --app-drawer-width: 500px;

                }
          
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
                    position: fixed;
                    background-color: white;
                    align-items: center;
                    flex-direction: column;
                    display: flex;
                    width: 64px;
                    z-index: 5;
                }
                
                .menu-icon-wrapper {
                    padding: 12px;
                }
                
                #content {
                    margin-left: 64pX;
                } 
                
                #alignedDialog {
                   
                    outline: none;
                    position: fixed;
                    top: 32px;
                    z-index: 103;
                    width: 331px;
                    max-width: 331px;
                    right: 28px;
                    border-radius: 6px;
                }

                #short-cut-menu {
                    margin: 8px;
                    padding: 0;
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: flex-start;
                }
             </style>
             <app-header-layout>
                <app-header slot="header" fixed condenses effects="waterfall">
                    <app-toolbar>
                        <div main-title>{{localize('nameApp')}}</div>
                        <paper-select-language></paper-select-language>
                        <paper-icon-button icon="menu" on-tap="openApp" raised></paper-icon-button>
                        <paper-info></paper-info>
                        <paper-icon-button id="buttonDrawer" icon="user" on-click="_tapDrawer"></paper-icon-button>
                    </app-toolbar>
                </app-header>
                <div class="layout-container layout-horizontal">
                    <div id="menuContent">
                        <dom-repeat id="menu" items="{{modules}}" as="module">
                            <template>
                                <template is="dom-if" if="{{isAllowed(module.name)}}">
                                    <div class="menu-icon-wrapper">
                                        <paper-icon-button id="{{module.name}}" class="menu" icon="{{module.icon}}" on-tap="_tapMenu"></paper-icon-button>
                                        <paper-tooltip for="{{module.name}}" position="right">{{module.title}}</paper-tooltip>
                                    </div>
                                </template>
                            </template>
                        </dom-repeat>
                    </div>
                    <div id="content" class="layout-vertical layout-flex-auto layout-content" style="width: 500px;">
                        <iron-pages id="pages" selected="{{section}}" attr-for-selected="name"></iron-pages>
                    </div>
                </div>
            </app-header-layout>
            <app-drawer id="settingDrawer" align="right" swipe-open>
                <div style="padding: 4px;">
                    <paper-tabs selected="{{identitySelect}}">
                        <paper-tab>{{localize(labelIdentity)}}</paper-tab>
                        <paper-tab>Impianto</paper-tab>
                    </paper-tabs>
                    <iron-pages selected="{{identitySelect}}">
                        <div> 
                            <paper-auth selected="{{identitySelect}}" identity="{{identity}}"></paper-auth>
                        </div>
                        <div> 
                            <token-config></token-config>
                        </div>
                  </iron-pages>
                    
                </div>
            </app-drawer>
            <paper-dialog id="alignedDialog" no-overlap horizontal-align="left" vertical-align="top">
                <div id="short-cut-menu">
                   
                <div>
            </paper-dialog>
        `;
    }

    static get properties() {
        return {

            identity: {
                observer: 'changeIdentity'
            },

            section: {
                type: String,
                notify: true,
                value : 'playlist',
                observer: 'changeSection'
            },

            labelIdentity: {
                value : 'login',
            },

            identitySelect: {
                type: Number,
                notify: true,
            },

            modules: {
                type: Array,
                notify: true,
                observer: 'changeModules'
            },

            services : {
                notify: true,
                value : {
                    _config: "Config",
                    application:  "Application",
                    _aclService: 'Acl',
                    _localizeService: 'Localize',
                    _dexieManager : 'DexieManager',
                    StorageContainerAggregate : {
                        _configStorage :"ConfigStorage"
                    }
                }
            },

            application :  {
                observer: 'changeApplicationService'
            },

            _configStorage: {
                readOnly: true
            }
        }
    }

    changeIdentity(newValue) {
      
        if (newValue) {
            this.labelIdentity = 'user';
        } else {
            this.labelIdentity = 'login';
        }
    }

    constructor() {
        super();
        this.resources = lang;
    }

    connectedCallback() {
        super.connectedCallback();
        this.updateHeightMenu();
        document.body.onresize = (event) => {
            this.updateHeightMenu();
        }
    }

    /**
     * @param {Event} evt 
     */
    openApp(evt) {
        this.$.alignedDialog.positionTarget = evt.element;
        this.$.alignedDialog.open();
    }

    /**
     * Update
     */
    updateHeightMenu() {
        this.$.menuContent.style.height = `${this._getMaxHeight()}px`;
    }

    /**
     * @returns {number}
     * @private
     */
    _getMaxHeight() {
        let body = document.body,
            html = document.documentElement;

        return Math.max( body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight );
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

        newValue.getEventManager().on(
            Application.IMPORT_MODULE,
            new Listener(this.importModuleEvt.bind(this))
        );


        newValue.getEventManager().on(
            Application.DELETE_MODULE,
            new Listener(this.deleteModuleEvt.bind(this))
        );
    }

    /**
     * @param evt
     */
    loadModules(evt) {
        this.modules = evt.data;
    }

    /**
     * @param evt
     */
     importModuleEvt(evt) {
        let elem = document.createElement(evt.data.getEntryPoint().getName());
        elem.name = evt.data.getName();
        this.$.pages.appendChild(elem);
        this.$.menu.render();
        this.changeSection(this.section);
    }

    deleteModuleEvt(evt) {
        this.modules = this.application.getModules();
        this.$.menu.render();
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

            let shortcutComponents = this.modules[cont].getShortcutComponent();
            for (let index = 0; shortcutComponents.length > index; index++) {
                elem = document.createElement(shortcutComponents[index].getName());
                this.$['short-cut-menu'].appendChild(elem);
            }
        }
    }

    /**
     * @param {string} value 
     */
    changeSection(value) {
        let nodes = this.shadowRoot.querySelector('#menuContent').querySelectorAll('div');
        nodes.forEach(element => {
            element.style.backgroundColor = 'white';
            let paperIconBtn = element.querySelector('paper-icon-button');
            paperIconBtn.style.color = '#015b63';
        });

        

        if (value == 'dashboard') {
            this._adjustDashboardIndex();
        }

        let paperIconBtn = this.shadowRoot.querySelector('#' + value);
        if (paperIconBtn)  {
            paperIconBtn.style.color = 'white';
            paperIconBtn.parentElement.style.backgroundColor = '#015b63';
        } else {
            setTimeout(
                function() {
                    let paperIconBtn = this.shadowRoot.querySelector('#' + value);

                    if (!paperIconBtn) {
                        this.$.menu.render();
                        paperIconBtn = this.shadowRoot.querySelector('#' + value);
                    }

                    paperIconBtn.style.color = 'white';
                    paperIconBtn.parentElement.style.backgroundColor = '#015b63';
                }.bind(this),
                2000
            );
        }
    }

    _adjustDashboardIndex() {

        document.querySelector('application-layout')
            .shadowRoot.querySelector('#content')
            .querySelector('dashboard-index')
            .$.grid._adjustToWindow();
    }
}

window.customElements.define('application-layout', ApplicationLayout);
