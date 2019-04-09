import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import {DsignServiceInjectorElement} from "../../../../elements/service/dsign-service-injector";

/**
 * @customElement
 * @polymer
 */
class PaperPlayerManager extends DsignServiceInjectorElement {


    static get properties () {
        return {

            monitor : {
                notify: true
            }
        }
    }

    ready() {
        super.ready();

        container.get('ReceiverContainerAggregate')
            .get('MonitorReceiver')
            .on('papar-player-config', this.configPaperPlayer.bind(this));

        container.get('ReceiverContainerAggregate')
            .get('MonitorReceiver')
            .on('papar-player-update', this.updatePaperPlayer.bind(this));
    }

    /**
     * @param evt
     * @param {object} msg
     */
    configPaperPlayer(evt, msg) {

        this._hydrateMonitor(msg);
        this._appendPaperPlayer(document.body, this.monitor);
    }

    updatePaperPlayer(evt, msg) {

        this._hydrateMonitor(msg);
        console.log('sucaaaaaa');

    }

    /**
     * @param monitorData
     * @private
     */
    _hydrateMonitor(monitorData) {
        this.monitor = container.get('HydratorContainerAggregate')
            .get('MonitorEntityHydrator')
            .hydrate(monitorData);
    }

    /**
     * @param node
     * @param monitor
     * @private
     */
    _appendPaperPlayer(node, monitor) {

        let paperPlayerElement = document.createElement("paper-player");
        paperPlayerElement.defaultTimeslotId = monitor.defaultTimeslotId ? monitor.defaultTimeslotId : undefined;
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