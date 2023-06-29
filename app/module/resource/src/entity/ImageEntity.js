import {FileEntity} from './FileEntity';
import {DimensionMixin} from './mixin/DimensionMixin';

/**
 * @class ImageEntity
 */
export class ImageEntity extends DimensionMixin(FileEntity) {

    constructor() {
        super();

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'image'}
        );
    }
}