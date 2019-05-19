import {html} from '@polymer/polymer/polymer-element.js';
import {mixinBehaviors} from '@polymer/polymer/lib/legacy/class.js';
import {DsignLocalizeElement} from "../../../../elements/localize/dsign-localize";
import {EntityBehavior} from "../../../../elements/storage/entity-behaviour";
import '@polymer/paper-input/paper-input';
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/iron-flex-layout/iron-flex-layout';
import '@polymer/iron-form/iron-form';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@fluidnext-polymer/paper-input-file/icons/paper-input-file-icons';
import '@fluidnext-polymer/paper-input-file/paper-input-file';
import '@polymer/paper-tooltip/paper-tooltip';
import {flexStyle} from '../../../../style/layout-style';
import {lang} from './language/upsert-language';

/**
 * @customElement
 * @polymer
 */
class ResourceViewUpsert extends mixinBehaviors([EntityBehavior], DsignLocalizeElement) {

    static get template() {
        return html`
                ${flexStyle}
                <style>

                </style>
                <slot name="header"></slot>
                <div id="container">
                   <iron-form id="formResource">
                        <form method="post">
                            <div>
                                <paper-input id="name" name="name" label="{{localize('name')}}" value="{{entity.name}}" required></paper-input>
                                <paper-input-file id="fileUpload" label="{{localize('search-file')}}" accept="image/png, image/jpeg, video/*, audio/*, application/zip"></paper-input-file>
                                <div>
                                    <paper-input id="tag" name="name" label="{{localize('tag')}}" on-keypress="addTag"></paper-input>
                                    <paper-chips id="chips" items="{{entity.tags}}"></paper-chips>
                                </div>
                            </div>
                            <div>
                                <div class="flex flex-horizontal-end" style="margin-top: 20px;">
                                    <paper-button on-tap="submitResourceButton">{{localize(labelAction)}}</paper-button>
                                </div>
                            </div>
                        </form>
                    </iron-form>
                </div>
        `;
    }

    static get properties () {
        return {

            entity: {
                observer: '_changeEntity',
                value: {}
            },

            labelAction: {
                type: String,
                value: 'save'
            },

            services : {
                value : {
                    "StorageContainerAggregate": {
                        "resourceStorage":"ResourceStorage"
                    },
                    "HydratorContainerAggregate": {
                        "resourceEntityHydrator":"ResourceEntityHydrator"
                    }
                }
            },

        };
    }

    constructor() {
        super();
        this.resources = lang;
    }

    ready() {
        super.ready();
        this.$.formResource.addEventListener('iron-form-presubmit', this.submitResource.bind(this));
    }

    /**
     * @param evt
     */
    addTag(evt) {
       if (evt.charCode === 13 && evt.target.value) {
            this.$.chips.add(evt.target.value);
            this.$.tag.value = "";
       }
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
    submitResourceButton(evt) {
        this.$.formResource.submit();
    }

    /**
     * @param evt
     */
    submitResource(evt) {
        evt.preventDefault();

        let method = this.getStorageUpsertMethod();
        let name = this.$.name.value;
        let toHydrate =  method === 'update' ? this.entity : undefined;

        this.entity = this.resourceEntityHydrator.hydrate(this.$.fileUpload.files[0], toHydrate);
        this.entity.name = name;
        this.entity.resourceToImport = this.$.fileUpload.files[0];


        this.resourceStorage[method](this.entity)
            .then((data) => {

                if (method === 'save') {
                   // this.entity = new (this.EntityContainerAggregate.get(MonitorConfig.MONITOR_CONTAINER_ENTITY_SERVICE).constructor)();
                   // this.$.formResource.reset();
                    this.entity = {};
                    this.$.formResource.reset();
                }

                this.$.fileUpload.reset();
            });

    }
}
window.customElements.define('resource-view-upsert', ResourceViewUpsert);
