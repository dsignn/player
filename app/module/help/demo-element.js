import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

import '@polymer/app-media/app-media-devices';
import '@polymer/app-media/app-media-video';
import '@polymer/app-media/app-media-stream';
import '@polymer/paper-badge/paper-badge';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-card/paper-card';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-dialog/paper-dialog';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu';
import '@polymer/paper-fab/paper-fab';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-item/paper-item';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-progress/paper-progress';
import '@polymer/paper-radio-button/paper-radio-button';
import '@polymer/paper-radio-group/paper-radio-group';
import '@polymer/paper-slider/paper-slider';
import '@polymer/paper-spinner/paper-spinner';
import '@polymer/paper-swatch-picker/paper-swatch-picker';
import '@polymer/paper-tabs/paper-tabs'
import '@polymer/paper-toast/paper-toast'
import '@polymer/paper-toggle-button/paper-toggle-button'
import '@polymer/paper-tooltip/paper-tooltip';

import '@webcomponents/webcomponentsjs/';

/**
 * @customElement
 * @polymer
 */
class DemoElement extends PolymerElement {


    static get properties() {
        return {
            /**
             * `autoValidate` Set to true to auto-validate the input value.
             */
            players: {
                type: Array,
                value:  [
                    {
                        numberShirt: 35,
                        name: 'KD',
                        text: 'vaffamoc'
                    },
                    {
                        numberShirt: 30,
                        name: 'Curry',
                        text: 'giusto'
                    },
                    {
                        numberShirt: 11,
                        name: 'Culo',
                        text: 'fatti due domande'
                    }
                ]
            },
        };
    }

    tapToast(evt) {
        this.openToad = !this.openToad;
    }

    tapDialog() {
        this.$.dialog.open();
    }

    static get template() {
        return html`
            <style>
                :host { 
                    padding-bottom: 20px;
                }
            
                .container {
                    margin-bottom: 40px;
                }
                
                .section {
                    margin-top: 10px;
                }
            
                .paper-badge {
                    width: fit-content;
                    display: inline-block;
                    margin-left: 5px;
                    margin-right: 30px;
                }
                /* Need to position the badge to look like a text superscript */
                .paper-badge > paper-badge {
                    --paper-badge-margin-left: 20px;
                    --paper-badge-margin-bottom: 0px;
                }
                
                paper-card {
                    width: 300px;
                    height: auto;
                }
               
                .paper-progress div {
                    margin-top: 8px;
                    margin-bottom: 8px;
                }
               
                paper-progress,   
                paper-slider,
                paper-radio-button {
                    width: 100%;
                }
               
                paper-progress.slow {
                  --paper-progress-indeterminate-cycle-duration: 20s;
                }
                
                .paper-spinner div {
                    display: flex;
                    align-items: center;
                }
                
                .paper-spinner div span {
                    padding-right: 8px;
                }
                
                #id_4 {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: orange;
                }
                
                .paper-slider div {
                    margin-top: 8px;
                    margin-bottom: 8px;
                }
                
                paper-dialog {
                    height: 300px;
                    width: 300px;
                }
                
            </style>
            <div class="container">
                <div class="paper-badge" tabindex="0">
                    <span>paper badge</span>
                    <paper-badge icon="icons:apps" label="happy"></paper-badge>
                </div>
                <div class="paper-button section" tabindex="1">
                    <paper-button>paper button</paper-button>
                </div>
                <div class="paper-card section" tabindex="2">
                    <paper-card heading="Emmental" image="http://placehold.it/300x100/FFC107/000000" alt="Emmental">
                        <div class="card-content">
                            paper card  
                        </div>
                        <div class="card-actions">
                            <paper-button>Share</paper-button>
                            <paper-button>Explore!</paper-button>
                        </div>
                    </paper-card>
                </div>
                <div class="paper-dropdown-menu section" tabindex="3">
                    <paper-dropdown-menu label="Paper dropdown menu">
                      <paper-listbox slot="dropdown-content" class="dropdown-content">
                        <paper-item>select 1</paper-item>
                        <paper-item>select 2</paper-item>
                        <paper-item>select 3</paper-item>
                        <paper-item>select 3</paper-item>
                      </paper-listbox>
                    </paper-dropdown-menu>
                </div>
                <div class="paper-icon-button section" tabindex="4">
                    <paper-icon-button icon="icons:apps"></paper-icon-button>
                </div>
                <div class="paper-item section" tabindex="3">
                    <paper-item class="fancy">paper item 1</paper-item>
                    <paper-item class="fancy">paper item 2</paper-item>
                    <paper-item class="fancy">paper item 3</paper-item>
                </div>
                <div class="paper-menu-button section" tabindex="5">
                    <paper-menu-button>
                        <paper-icon-button icon="menu" slot="dropdown-trigger" alt="menu"></paper-icon-button>
                        <paper-listbox slot="dropdown-content">
                            <paper-item>paper menu button 1</paper-item>
                            <paper-item>paper menu button 2</paper-item>
                            <paper-item>paper menu button 3</paper-item>
                        </paper-listbox>
                    </paper-menu-button>
                </div>
                 <div class="paper-progress section" tabindex="6">
                    <paper-progress indeterminate></paper-progress>
                    <div>paper progress</div>
                    <paper-progress indeterminate class="slow"></paper-progress>
                </div>
                <div class="paper-spinner section" tabindex="7">
                    <div>
                        <span>paper spinner </span> <paper-spinner active></paper-spinner>
                    </div>
                </div>
                <div class="paper-swatch-picker section" tabindex="8">
                    <paper-swatch-picker></paper-swatch-picker>
                    <paper-swatch-picker color="#E91E63"></paper-swatch-picker>
                </div>
                <div class="paper-tabs section" tabindex="9">
                    <paper-tabs selected="0">
                        <paper-tab>paper tab 1</paper-tab>
                        <paper-tab>paper tab 2</paper-tab>
                        <paper-tab>paper tab 3</paper-tab>
                    </paper-tabs>
                </div>
                <div class="paper-tooltip section" tabindex="10">
                    <div id="id_4" tabindex="0"></div>
                    <paper-tooltip for="id_4" offset="0">paper tooltip</paper-tooltip>
                </div>
                <div class="paper-slider section" tabindex="11">
                    <paper-slider pin value="20"></paper-slider>
                     <div>paper slider</div>
                    <paper-slider id="ratings" pin snaps max="10" max-markers="10" step="1" value="5"></paper-slider>
                </div>
                <div class="paper-input section" tabindex="12">
                    <paper-input label="paper input"></paper-input>
                </div>
                <div class="paper-checkbox section" tabindex="13">
                    <paper-checkbox>paper checkbox</paper-checkbox>
                </div>
                <div class="paper-listbox section" tabindex="14">
                    <div>paper listbox</div>
                    <paper-listbox selected="1">
                      <paper-item>paper item 1</paper-item>
                      <paper-item>paper item 2</paper-item>
                    </paper-listbox>
                </div>
                <div class="paper-radio-button section" tabindex="15">
                    <paper-radio-button>paper radio button 1</paper-radio-button>
                    <paper-radio-button checked>paper radio button 2</paper-radio-button>
                    <paper-radio-button disabled>paper radio button 3</paper-radio-button>
                </div>
                <div class="paper-radio-group section" tabindex="16">
                    <div>paper radio group</div>
                    <paper-radio-group selected="small">
                      <paper-radio-button name="small">paper radio button 1</paper-radio-button>
                      <paper-radio-button name="medium">paper radio button 2</paper-radio-button>
                      <paper-radio-button name="large">paper radio button 2</paper-radio-button>
                    </paper-radio-group>
                </div>
                <div class="paper-toggle-button section" tabindex="17">
                    <paper-toggle-button class="green">paper toggle button</paper-toggle-button>
                </div>
                 <div class="paper-fab section" tabindex="18">
                    <div>paper fab</div>
                    <paper-fab  class="label" label="😻" title="heart eyes cat"></paper-fab>
                </div>
                <div class="paper-toast section" tabindex="19">
                    <paper-button on-tap="tapToast">paper toast</paper-button>
                    <paper-toast text="paper toast" opened="{{openToad}}"></paper-toast>
                </div>
                <div class="paper-dialog section" tabindex="20">
                    <paper-button on-tap="tapDialog">paper dialog</paper-button>
                    <paper-dialog id="dialog">
                        <h2>paper dialog</h2>
                        <paper-dialog-scrollable>
                            Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum 
                        </paper-dialog-scrollable>
                        <div class="buttons">
                            <paper-button dialog-dismiss>Cancel</paper-button>
                            <paper-button dialog-confirm autofocus>Accept</paper-button>
                        </div>
                    </paper-dialog>
                </div>
                 <div class="paper-media section">
                    <app-media-devices
                        kind="videoinput"
                        selected-device="{{camera}}">
                    </app-media-devices>
                     <app-media-stream
                        active
                        video-device="[[camera]]"
                        stream="{{cameraStream}}">
                    </app-media-stream>
                    <app-media-video
                        source="[[cameraStream]]"
                        autoplay>
                    </app-media-video>
                </div>
            </div>
        `;
    }
}

window.customElements.define('demo-element', DemoElement);
