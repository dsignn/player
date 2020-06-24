import {FileEntity} from './FileEntity';

/**
 * @class AudioEntity
 */
export class AudioEntity extends FileEntity {

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