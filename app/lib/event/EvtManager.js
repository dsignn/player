
try {
    EvtExecution = require('./EvtExecution.js');
}
catch(err) {

    EvtExecution = require(__dirname + '/lib/event/EvtExecution.js');
}

/**
 *
 */
class EvtManager {

    /**
     * Constructor
     */
    constructor() {
        this.queues = {};
    }

    /**
     * @param event
     * @param action
     */
    on(event, action) {

        if (!this.queues[event]) {
            this.queues[event] = [];
        }

        this.queues[event].push(new EvtExecution(action));
    }

    /**
     *
     * @param event
     * @param params
     * @param clearListener
     */
    fire(event, params, clearListener) {

        if (this.queues[event]) {
            let eventObject = new Evt(event, params);
            for (let cont = 0; this.queues[event].length > cont; cont++) {
                this.queues[event][cont].execute(eventObject);
                if (eventObject.stopPropagation) {
                    break;
                }
            }

            if (clearListener) {
                delete this.queues[event];
            }
        }
    }

    _consoleDebug() {
        console.group();
        console.log('Number event', Object.keys(this.queues).length);
        for (let key in this.queues) {
            console.log(key + ' Number off attach', this.queues[key]);
        }
        console.groupEnd();
    }
}

module.exports = EvtManager;