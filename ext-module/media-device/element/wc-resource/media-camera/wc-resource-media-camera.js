(async () => {
    const { html, PolymerElement } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@polymer/polymer/polymer-element.js`));
  
    /**
     *
     */
    class WcResourceMediaCamera extends PolymerElement {

        static get template() {
            return html`
                    <style>

                #camera {
                    height: 100%;
                    width: 100%;
                    object-fit: fill;
                }

            </style>
            <video id="camera" autoplay></video>
            `;
        }

        static get properties () {
            return {

                mediaDevice: {
                    type: Object,
                    notify: true,
                    observer: '_mediaDeviceChanged',
                }
            }
        }

        disconnectedCallback() {
            super.disconnectedCallback();
            if (this.$.camera.srcObject) {
                this.$.camera.srcObject.getTracks().forEach((track) => {
                    track.stop();
                });
            }
        }

        /**
         * @param newValue
         * @param oldValue
         * @private
         */
        _mediaDeviceChanged(newValue, oldValue) {

            let constraint = { video : {deviceId: { exact: newValue.deviceId}}};
        
            navigator.mediaDevices.getUserMedia(constraint)
                .then((MediaStream) => {           
                        this.$.camera.srcObject = MediaStream;
                        this.$.camera.play().then((data) => {
                    }).catch((error) => {
                        console.error(error);
                    });
                }).catch((err) => {
                    console.error(err);
                });
        }

        /**
         *
         */
        createMockData() {

            navigator.mediaDevices.enumerateDevices({video:true, audio:false})
                .then((devices) => {
                    this.mediaDevice = devices.find((element) => {
                        return element.kind ==='videoinput';
                    });
                })
                .catch(function (err) {
                    console.error(err);
                });
        }
    }


    window.customElements.define('wc-resource-media-camera', WcResourceMediaCamera);

})();