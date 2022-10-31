import { EventManagerAware } from "@dsign/library/src/event";
/**
 * @class ProxyConfigMonitorService
 */
 export class ProxyConfigMonitorService extends EventManagerAware {

    constructor(sender, receiver) {
        super();

        this.sender = sender;

        this.receiver = receiver;

        this.receiver.on('monitor-id', this.receiverMonitorId.bind(this));
    }

    receiverMonitorId(evt, monitorId) {
        let ele = document.createElement('meta');
        ele.setAttribute('monitor-id', monitorId);
        document.getElementsByTagName('head')[0].appendChild(ele);
        console.log('DIO GGGGGGGGGGGGGGG')
        this.sendMonitorConfigRequire(monitorId);
    }

    /**
     * @param {string} monitorId 
     */
    sendMonitorConfigRequire(monitorId) {
        console.log('DIO FFFFFFFFFFFFFFFFff')
        this.sender.send('require-monitor-config', monitorId);
    }
 }