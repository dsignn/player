import {FileEntity} from './FileEntity';

/**
 * @class VideoEntity
 */
export class VideoEntity extends FileEntity {

    constructor() {
        super();

        /**
         * @type {Number|null}
         */
        this.duration = null;

        /**
         * @type {Number|null}
         */
        this.fps = null;

        /**
         * @type {Object}
         */
        this.dimension = {};

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'video'}
        );
    }

    /**
     * @returns {Number}
     */
    getWidth() {
        return this.dimension.width;
    }

    /**
     * @returns {Number}
     */
    getHeight() {
        return this.dimension.height;
    }
}