import {FileEntity} from './FileEntity';
import {DurationMixin} from './mixin/DurationMixin';

/**
 * @class AudioEntity
 */
export class AudioEntity extends DurationMixin(FileEntity) {

    constructor() {
        super();


        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'audio'}
        );
    }
}