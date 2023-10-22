import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class Messages
 */
export class Messages extends EventManagerAware {

    static get APPEND_MESSAGE() { return 'append_message'; }

    static get REMOVE_MESSAGE() { return 'remove_message'; }

    constructor() {
        super();
        this.messages = [
            {
                'id': 'test',
                'message': 'Sono un bel messaggio'
            },
            {
                'id': 'test2',
                'message': 'Sono un bel messaggio'
            },
        ];
    }

    /**
     * 
     * @param {string} key 
     * @param {string} value 
     */
    appendMessage(key, value) {

        let message = {
            'id': key,
            'message': value
        }

        let search = this.messages.find((element) => {
            return element.id === key;
        });

        if (search > -1) {
      
            es.splice(search, 1, message);
            this.getEventManager().emit(
                Messages.APPEND_MESSAGE,
                ele
            )
        } else {
            this.messages.push(message);
        }

    
        this.getEventManager().emit(
            Messages.APPEND_MESSAGE,
            message
        )
    }

    /**
     * @param {string} key 
     */
    removeMessage(key) {
        
        let search = this.messages.find((element) => {
            return element.id === key;
        });

        if (search > -1) {
            let ele = array.splice(search, 1);
            this.getEventManager().emit(
                Messages.APPEND_MESSAGE,
                ele
            )
        } 
    }

    getMessages() {
        return this.messages;
    }
}
