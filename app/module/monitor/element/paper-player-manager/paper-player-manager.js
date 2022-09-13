import {PolymerElement} from '@polymer/polymer/polymer-element.js';
import {ServiceInjectorMixin} from "@dsign/polymer-mixin/service/injector-mixin";

/**
 * @customElement
 * @polymer
 */
class PaperPlayerManager extends ServiceInjectorMixin(PolymerElement) {


    static get properties () {
        return {

            /**
             * @type MonitorEntity
             */
            monitor : {
                notify: true
            },

            /**
             * @type object
             */
            services : {
                value : {
                    "ReceiverContainerAggregate": {
                        "_monitorReceiver":"MonitorReceiver"
                    },
                    "HydratorContainerAggregate": {
                        // TODO add storage service on the player
                        "_monitorEntityHydrator": "MonitorEntityHydrator"
                    }
                }
            },

            /**
             * @type ReceiverInterface
             */
            _monitorReceiver : {
                type: Object,
                readOnly: true,
                observer : 'changeMonitorReceiver'
            },

            /**
             * @type ReceiverInterface
             */
            _monitorEntityHydrator : {
                type: Object,
                readOnly: true
            }
        }
    }

    /**
     * @param {ReceiverInterface} monitorReceiver
     */
    changeMonitorReceiver(monitorReceiver) {
        if(!monitorReceiver) {
            return
        }

        monitorReceiver.on('paper-player-update', this.updatePaperPlayer.bind(this));
        monitorReceiver.on('paper-player-config', this.configPaperPlayer.bind(this));
    }

    /**
     * @param evt
     * @param {object} msg
     */
    configPaperPlayer(evt, msg) {

        this.monitor = this._monitorEntityHydrator.hydrate(msg);
        this._appendPaperPlayer(document.body, this.monitor);
    }

    /**
     * @param evt
     * @param msg
     */
    updatePaperPlayer(evt, msg) {

        this.monitor = this._monitorEntityHydrator.hydrate(msg);
        // TODO implements better solution
        let paperPlayer = document.querySelector('paper-player');
        if (paperPlayer) {
            paperPlayer.remove();
        }
        this._appendPaperPlayer(document.body, this.monitor);
    }

    /**
     * @param node
     * @param monitor
     * @private
     */
    _appendPaperPlayer(node, monitor) {

        let paperPlayerElement = document.createElement("paper-player");
        paperPlayerElement.defaultTimeslotReference = monitor.defaultTimeslotReference ? monitor.defaultTimeslotReference : null;
        paperPlayerElement.identifier = monitor.id;
        paperPlayerElement.setStyles(monitor);

        this._getNodeToAppend(node).appendChild(paperPlayerElement);

        if (monitor.monitors && Array.isArray(monitor.monitors) && monitor.monitors.length > 0) {
            for (let cont = 0; monitor.monitors.length > cont; cont++) {
                this._appendPaperPlayer(paperPlayerElement, monitor.monitors[cont]);
            }
        }
    }

    /**
     * @param {HtmlElement} node
     * @return {HtmlElement}
     * @private
     */
    _getNodeToAppend(node) {
        let toAppend = node;
        if (toAppend.tagName === "PAPER-PLAYER") {
            toAppend = node.$.monitors;
        }

        return toAppend;
    }

}
window.customElements.define('paper-player-manager', PaperPlayerManager);
