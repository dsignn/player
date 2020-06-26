import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";
import {LocalizeMixin} from "@dsign/polymer-mixin/localize/localize-mixin";
import {StorageEntityMixin} from "@dsign/polymer-mixin/storage/entity-mixin";
import '@fluidnext-polymer/paper-autocomplete/paper-autocomplete';
import '@fluidnext-polymer/paper-chip/paper-chips';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-ripple/paper-ripple';
import {flexStyle} from '../../../../style/layout-style';
import {autocompleteStyle} from '../../../../style/autocomplete-custom-style';
import {lang} from './language/upsert-language';

/**
 * @customElement
 * @polymer
 */
class TimerViewUpsert extends StorageEntityMixin(LocalizeMixin(ServiceInjectorMixin(PolymerElement)))  {

    static get template() {
        return html`
                ${flexStyle}
                <style>
                    div#container {
                        margin-top: 8px;
                    }
                    
                    paper-card.container {
                        @apply --paper-card-container;
                    }
                    
                    #container {
                            @apply --layout-vertical;
                        }
                    
                        #content-left {
                            @apply --layout-flex;
                        }
                        
                        #content-right {
                            @apply --layout-flex;
                            padding-top: 12px;
                        }
                        
      
                </style>
                <slot name="header"></slot>
                <iron-form id="formResource">
                    <form method="post">
                        <paper-input id="name" name="name" value="{{entity.name}}" label="{{localize('name')}}" required></paper-input>
                        <div class="flex-horizontal flex" style="width: 100%;">
                            <div class="flex-basis-33">
                                <paper-input label="{{localize('hours-start')}}" value="{{entity.startAt.hours}}" type="number" required></paper-input>
                            </div>
                            <div class="pd-r"></div>
                            <div class="flex-basis-33">
                                <paper-input label="{{localize('minutes-start')}}" value="{{entity.startAt.minutes}}" type="number" required></paper-input>
                            </div>
                            <div class="pd-r"></div>
                            <div class="flex-basis-33">
                                <paper-input label="{{localize('seconds-start')}}" value="{{entity.startAt.seconds}}" type="number" required></paper-input>
                            </div>
                        </div>
                        <div class="flex-horizontal flex" style="width: 100%;">
                            <div class="flex-basis-33">
                                <paper-input label="{{localize('hours-start')}}" value="{{entity.endAt.hours}}" type="number" required></paper-input>
                            </div>
                            <div class="pd-r"></div>
                            <div class="flex-basis-33">
                                <paper-input label="{{localize('minutes-start')}}" value="{{entity.endAt.minutes}}" type="number" required></paper-input>
                            </div>
                            <div class="pd-r"></div>
                            <div class="flex-basis-33">
                                <paper-input name="name" label="{{localize('seconds-start')}}" value="{{entity.endAt.seconds}}" type="number" required></paper-input>
                            </div>
                        </div>
    
                        <paper-dropdown-menu id="type" label="{{localize('type')}}">
                            <paper-listbox slot="dropdown-content" class="dropdown-content"  selected="0">
                                <paper-item value="timer">{{localize('timer')}}</paper-item>
                                <paper-item value="countdown">{{localize('countdown')}}</paper-item>
                            </paper-listbox>
                        </paper-dropdown-menu>
                        <paper-checkbox checked="{{entity.autoStart}}">{{localize('autostart')}}</paper-checkbox>
                        <div>
                            <div class="layout-horizontal flex-horizontal-end" style="margin-top: 20px;">
                                <paper-button on-tap="submitResourceButton">{{localize(labelAction)}}</paper-button>
                            </div>
                        </div>
                    </form>
                </iron-form>
        `;
    }

    static get properties () {
        return {

            /**
             * @type string
             */
            labelAction: {
                type: String,
                value: 'save'
            },

            services : {
                value : {
                    _notify: "Notify",
                    _localizeService: 'Localize',
                    StorageContainerAggregate : {
                        _storage : "TimerStorage"
                    }
                }
            },

            /**
             * @type Notify
             */
            _notify: {
                type: Object,
                readOnly: true
            }
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
    submitResourceButton(evt) {
        this.$.formResource.submit();
    }

    /**
     *
     */
    submitResource(evt) {
        evt.preventDefault();

        let method = this.getStorageUpsertMethod();
        this.entity.type = this.$.type.selectedItem.getAttribute('value');

        this._storage[method](this.entity)
            .then((data) => {

                if (method === 'save') {
                    this.entity = this._storage.getHydrator().hydrate({});
                    this.$.formResource.reset();
                }

                this._notify.notify(this.localize(method === 'save' ? 'notify-save' : 'notify-update'));
            });
    }
}
window.customElements.define('timer-view-upsert', TimerViewUpsert);
