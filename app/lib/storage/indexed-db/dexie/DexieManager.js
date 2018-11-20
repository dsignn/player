
class DexieManager {

    constructor(nameDatabase) {

        /**
         * @type {String}
         */
        this.nameDatabase = nameDatabase;

        /**
         * @type {Array}
         */
        this.schema = [];

        /**
         * @type {number}
         */
        this.version = 1;

        /**
         * @type {Array}
         */
        this.events = [];
    }

    init() {
        const Dexie = require('dexie');

        this.db = new Dexie( this.nameDatabase + 'test');

        let schema =  {};
        for (let cont=0; this.schema.length > cont; cont++) {
            let indexLabel = '';
            for (let index = 0; this.schema[cont].index.length > index; index++) {

                indexLabel = index === (this.schema[cont].index.length - 1) ?
                    indexLabel + this.schema[cont].index[index] :
                    indexLabel + this.schema[cont].index[index] + ', ';

            }

            schema[this.schema[cont].name] = indexLabel;
        }

        this.db.version(this.version).stores(schema);

        for (let cont = 0; this.events.length > cont; cont++) {
            this.db.on('ready', this.events[cont]);
        }

        this.db.open();
    }

    /**
     * @param schema
     */
    pushSchema(schema) {

        this.schema.push(schema);
    }

    /**
     *
     * @param ready
     */
    onReady(ready) {
       this.events.push(ready);
    }
}

module.exports = DexieManager;