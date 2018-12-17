
class Audio extends GenericFile {

    constructor() {
        super();

        /**
         * @type {Number|null}
         */
        this.duration = null;

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'audio'}
        );
    }
}

module.exports = Audio;