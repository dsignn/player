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

        /**
         * @param newValue
         * @param oldValue
         * @private
         */
        _mediaDeviceChanged(newValue, oldValue) {

            let constraint = { video : {deviceId: { exact:  newValue.deviceId}}};
            console.log(newValue);
            navigator.mediaDevices.getUserMedia(constraint)
                .then((stream) => {
                    this.$.camera.srcObject = stream;
                })
                .catch((err) => {
                    console.log(err);
                });
        }

        /**
         *
         */
        createMockData() {

            navigator.mediaDevices.enumerateDevices({video:true})
                .then((devices) => {
                    this.mediaDevice = devices.find((element) => {
                        return element.deviceId ==='4361251acb9d5732c5a970aeba29360e7f808dbc2aa41cc37bb46b28dbe424dd';
                    });
                })
                .catch(function (err) {
                    console.error(err);
                });
        }
    }


    window.customElements.define('wc-resource-media-camera', WcResourceMediaCamera);

})();