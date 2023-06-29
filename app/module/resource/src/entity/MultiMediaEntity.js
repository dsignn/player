import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class MultiMediaEntity
 */
export class MultiMediaEntity extends EntityIdentifier {

    constructor() {
        super();

        this.resources = [];

        Object.defineProperty(
            this,
            "typeLabel",
            {writable: false, enumerable: true, configurable: true, value: 'multimedia'}
        );
    }
}