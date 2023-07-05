import {FileEntity} from './FileEntity';
import {DurationMixin} from './mixin/DurationMixin';

/**
 * @class AudioEntity
 */
export class AudioEntity extends DurationMixin(FileEntity) {

    constructor() {
        super();
    }
}