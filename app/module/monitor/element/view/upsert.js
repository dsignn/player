import {html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '@polymer/paper-input/paper-input';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '../paper-monitor-update/paper-monitor-update';
import {flexStyle} from '../../../../style/layout-style';
import {lang} from './language/upsert-language';
import {DsignServiceInjectorElement} from "../../../../elements/service/dsign-service-injector";

/**
 * @customElement
 * @polymer
 */
class MonitorViewUpsert extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

    static get template() {
        return html`
                ${flexStyle}
                <style>
                    div#container {
                        margin-top: 8px;
                    }
                    
                    #monitorUpdate paper-monitor-update {
                      margin-bottom: 4px;
                    }
                                        
                    #content-left {
                        padding-right: 8px;
                    }
                
                    paper-card.container {
                        @apply --paper-card-container;
                    }
                    
                    iron-icon.info {
                        @apply --info-cursor;
                    }
                
                    @media (max-width: 900px) {
                        #container {
                            @apply --layout-vertical-reverse;
                        }
                    
                        #content-left {
                            @apply --layout-flex;
                        }
                        
                        #content-right {
                            @apply --layout-flex;
                        }
                    }
                        
                    @media (min-width: 901px) {
                        #container {
                             @apply  --layout-horizontal;
                        }
                    
                        #content-left {
                           @apply --layout-flex-8;
                        }
                        
                        #content-right {
                           @apply --layout-flex-4;
                        }
                    }
                </style>
                <slot name="header"></slot>
                <div id="container">
                    <div id="content-left">
                        <iron-form id="formMonitorContainer">
                            <form method="post" action="">
                                <paper-input name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                <div id="monitorUpdate">
                                    <dom-repeat items="{{entity.monitors}}" as="monitor">
                                        <template>
                                              <paper-monitor-update entity="{{monitor}}" on-toogle-always-on-top-monitor="_toogleAlwaysOnTop" hidden-always-on-top="{{showAlwaysOnTop}}"></paper-monitor-update>   
                                        </template>
                                    </dom-repeat>
                                </div>
                                <paper-button on-tap="submitMonitorContainerButton">{{localize(labelAction)}}</paper-button>
                            </form>
                        </iron-form>
                    </div>
                    <div id="content-right">
                        <paper-card class="container">
                            <iron-icon id="info" icon="info" class="info"></iron-icon>
                            <paper-tooltip for="info" position="bottom">{{localize('monitor-to-add')}}</paper-tooltip>
                            <iron-form id="formMonitor">
                                <form method="post">
                                    <paper-input name="name" label="{{localize('name')}}" required></paper-input>
                                    <paper-input name="height" label="{{localize('height')}}" type="number" required></paper-input>
                                    <paper-input name="width" label="{{localize('width')}}" type="number" required></paper-input>
                                    <paper-input name="offsetX" label="{{localize('offsetX')}}" type="number" required></paper-input>
                                    <paper-input name="offsetY" label="{{localize('offsetY')}}" type="number" required></paper-input>
                                    <paper-input name="polygon" label="{{localize('custom-polygon')}}"></paper-input>
                                    <paper-autocomplete id="parentMonitor" 
                                        label="{{localize('father-monitor')}}" 
                                        text-property="name" 
                                        on-autocomplete-change="_changeMonitor"
                                        remote-source>
                                    </paper-autocomplete>
                                    <div class="layout-horizontal layout-end-justified">
                                        <paper-button on-tap="submitMonitorButton">{{localize('add')}}</paper-button>
                                    </div>
                                </form>
                            </iron-form>
                        </paper-card>
                    </div>
                </div>
        `;
    }

    constructor() {
        super();
        this.resources = lang;
    }

    static get properties () {
        return {

            entityHydrator: {
                type: String,
                value: 'MonitorContaninerEntityHydrator'
            },

            services : {
                value : {
                    "EntityContainerAggregate" : "EntityContainerAggregate",
                    "HydratorContainerAggregate" : "HydratorContainerAggregate",
                    "StorageContainerAggregate": {
                        "MonitorStorage":"MonitorStorage"
                    }
                }
            },

            entity: {
                observer: '_changeEntity',
                value: {}
            },

            selected: {
                type: Number,
                value: 0
            },

            labelAction: {
                type: String,
                value: 'save'
            },

            showAlwaysOnTop: {
                value: false
            }
        };
    }

    static get observers() {
        return [
            'observerEntityToInject(entity, entityHydrator, HydratorContainerAggregate)'
        ]
    }

    ready() {
        super.ready();
        this.$.formMonitor.addEventListener('iron-form-presubmit', this.submitMonitor.bind(this));
        this.$.formMonitorContainer.addEventListener('iron-form-presubmit', this.submitMonitorContainer.bind(this));
        this.addEventListener('remove-monitor', this.removeMonitor.bind(this), true)
    }

    /**
     * @param newValue
     * @private
     */
    _changeEntity(newValue) {
        this.labelAction = 'save';
        if (!newValue) {
            return;
        }

        if (newValue.id) {
            this.labelAction = 'update';
        }
    }

    /**
     * @param evt
     */
    submitMonitorContainerButton(evt) {
        this.$.formMonitorContainer.submit();
    }

    /**
     * @param evt
     * @private
     */
    _changeMonitor(evt) {

        // TODO remove when fix paper autocomplete
        if (!evt.detail.text) {
            return;
        }

        let monitors = this.entity.getMonitors({nested:true});
        let filter = monitors.filter(
            element => {
                return element.name.search(new RegExp(evt.detail.text, 'i')) > -1;
            }
        );

        evt.detail.target.suggestions(
            filter
        );
    }

    /**
     * @param evt
     */
    submitMonitorContainer(evt) {
        let method = this.getStorageUpsertMethod();
        this.MonitorStorage[method](this.entity)
            .then((data) => {

                if (method === 'save') {
                    this.entity = new (this.EntityContainerAggregate.get(MonitorConfig.MONITOR_CONTAINER_ENTITY_SERVICE).constructor)();
                    this.$.formMonitorContainer.reset();
                }
            });
    }

    /**
     * @param evt
     */
    submitMonitorButton(evt) {
        this.$.formMonitor.submit();
    }

    /**
     * @param evt
     */
    submitMonitor(evt) {
        evt.preventDefault();
        let monitor = this.HydratorContainerAggregate
            .get(MonitorConfig.MONITOR_HYDRATOR_SERVICE)
            .hydrate(this.$.formMonitor.serializeForm());

        monitor.setId(
            require("@p3e/library").storage.util.MongoIdGenerator.statcGenerateId()
        );

        // TODO nested monitor
        if (this.$.parentMonitor.value) {

            this.$.parentMonitor.value.addMonitor(monitor);
            let element = MonitorViewUpsert.searchPaperMonitorUpdate(this, this.$.parentMonitor.value.id);
            element.notifyPath('entity.monitors.splice');

        } else {
            this.entity.addMonitor(monitor);
            this.notifyPath('entity.monitors.splice')
        }
        this.$.parentMonitor.clear();
        this.$.formMonitor.reset();
    }

    /**
     * @param  {CustomEvent} evt
     */
    removeMonitor(evt) {

        let parentMonitor = this.entity.getParent(evt.detail.id);
        this.entity.removeMonitor(evt.detail);
        if (parentMonitor) {
            let element = MonitorViewUpsert.searchPaperMonitorUpdate(this, parentMonitor.id);
            element.notifyPath('entity.monitors.splice');
        } else {
            this.notifyPath('entity.monitors.splice')
        }
    }

    /**
     * @param {CustomEvent} evt
     * @private
     */
    _toogleAlwaysOnTop(evt) {
        this.MonitorStorage.update(this.entity)
            .then((data) => {
                console.info('Change always on top');
            });
    }

    /**
     * @param node
     * @param id
     * @return {*}
     * @private
     */
    static searchPaperMonitorUpdate(node, id) {
        let list = node.shadowRoot.querySelectorAll('paper-monitor-update');
        let found = null;
        for (let cont = 0; list.length > cont; cont++) {

            if (list[cont].identifier === id) {
                found = list[cont];
                break;
            } else {
                found = found || MonitorViewUpsert.searchPaperMonitorUpdate(list[cont], id);
            }
        }
        return found;
    }
}
window.customElements.define('monitor-view-upsert', MonitorViewUpsert);
