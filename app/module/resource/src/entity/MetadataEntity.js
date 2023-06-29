import {FileEntity} from './FileEntity';
import {DataReferenceAwareMixin} from './mixin/DataReferenceAwareMixin';

/**
 * @class MetadataEntity
 */
export class MetadataEntity extends DataReferenceAwareMixin(FileEntity) {

    constructor() {
        super();

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'metadata'}
        );
    }
}