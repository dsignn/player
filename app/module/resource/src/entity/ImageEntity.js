import {FileEntity} from './FileEntity';

/**
/**
 * @class ImageEntity
 */
export class ImageEntity extends FileEntity {

    constructor() {
        super();

        /**
         * @type {Object}
         */
        this.dimension = {};

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'image'}
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