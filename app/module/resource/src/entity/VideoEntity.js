import {FileEntity} from './FileEntity';
import {DimensionMixin} from './mixin/DimensionMixin';
import {DurationMixin} from './mixin/DurationMixin';
import {FpsMixin} from './mixin/FpsMixin';

/**
 * @class VideoEntity
 */
export class VideoEntity extends FpsMixin(DimensionMixin(DurationMixin(FileEntity))) {

    constructor() {
        super();
    }
}