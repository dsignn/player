import {PolymerElement, html} from '@polymer/polymer/polymer-element'

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
        {{}}
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

        let constraint = { video : {deviceId: { exact:  newValue.id}}};

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
            .then(function (devices) {
                console.log(devices);
            })
            .catch(function (err) {
                console.error(err);
            });
    }
}


window.customElements.define('wc-resource-media-camera', WcResourceMediaCamera);
