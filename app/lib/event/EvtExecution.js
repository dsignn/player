/**
 *
 */
class EvtExecution {

    /**
     * Constructor
     */
    constructor(action) {
        if (!action || !action.constructor === Function) {
            throw new Error("An event handler must have a function as its handler!")
        }

        this.action = action;
    }

    /**
     * @param Evt event
     * @returns {*}
     */
    execute(event) {
        return this.action(event);
    }
}

module.exports = EvtExecution;