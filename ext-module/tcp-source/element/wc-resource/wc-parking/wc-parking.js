(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
    const { ServiceInjectorMixin } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/polymer-mixin/service/injector-mixin.js`));
    const { TcpSourceService } = await import(`${container.get('Application').getAdditionalModulePath()}/tcp-source/src/TcpSourceService.js`);

  
    /**
     *
     */
    class WcParking extends ServiceInjectorMixin(PolymerElement) {

        static get template() {
            return html`        
            <style>

                #tcp-source {
                    height: 100%;
                    width: 100%;
                    color: green;
                    background: black;
                }

                .p-container {
                    padding: 4px;
                    font-size: 230px;
                    line-height: 200px;
                    color: white;
                    background: #243B84;
                    height: 58%;
                }

                .p-data {
                    height: 40%;
                    font-size: 26px;
                }

                .row {
                    display: flex;
                    flex-direction: row;
                    padding: 4px;
                    height: 50%;
                }

                .col {
                    display: flex;
                    flex-direction: column;
                }

                .center {
                    justify-content: center;
                    align-items: center;
                }

                .number {
                    width: 44px;
                    text-align: center;
                }

                .text {
                    flex: 1
                }

            </style>
            <div id="tcp-source">
                <div class="p-container">P</div>
                <div class="col p-data ">
                    <div class="row center">
                        <div class="number">{{free}}</div>
                        <div class="text">LIBERI </div>
                    </div>
                    <div class="row center">
                        <div class="number">{{freeE}}</div>
                        <div class="text">LIBERI E</div>
                    </div>
                </div>
            </div>
            `;
        }

        static get properties () {
            return {

                tcpSource: {
                    type: Object,
                    notify: true,
                },

                free: {
                    value: 0
                },

                freeE: {
                    value: 0
                },

                /**
                 * @type object
                 */
                services : {
                    value : {
                        _tcpSourceService: 'TcpSourceService'
                    }
                },

                _tcpSourceService: {
                    readOnly: true,
                    observer: '_tcpSourceServiceChange'
                }
            }
        }

        /**
         * @param {*} service 
         */
        _tcpSourceServiceChange(service) {
            service.getEventManager().on(TcpSourceService.UPDATE_TCP_SOURCE_EVT, this._changeSource.bind(this));  
        }

        /**
         * @param {*} evt 
         * @param {object} data 
         * @returns 
         */
        _changeSource(evt, data) {
            if (!this.tcpSource && this.tcpSource.id !== data.id) {
                return;
            }
            let encodeData;
            try {
                encodeData = JSON.parse(data);
            } catch(error) {
                console.error(error);
            }

            this.free = encodeData['posti-liberi'];
            this.freeE = encodeData['posti-liberi-elettrici'];
        }
    }

    window.customElements.define('wc-parking', WcParking);

})();