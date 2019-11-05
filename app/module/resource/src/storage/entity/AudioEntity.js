/**
 * @class AudioEntity
 */
class AudioEntity extends FileEntity {

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

module.exports = AudioEntity;