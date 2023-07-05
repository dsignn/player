import {FileEntity} from './FileEntity';
import {DimensionMixin} from './mixin/DimensionMixin';

/**
 * @class ImageEntity
 */
export class ImageEntity extends DimensionMixin(FileEntity) {

    constructor() {
        super();
    }
}