import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class MultiMediaEntity
 */
export class MultiMediaEntity extends EntityIdentifier {

    constructor() {
        super();

        this.resources = [];

        /**
         * @type {Array}
         */
        this.tags = [];
    }
}