import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class ResourceSenderEntity
 */
 export class ResourceSenderEntity extends EntityIdentifier {

    constructor() {
        super();

        this.monitorContainerReference = {};

        this.resourceReference = {};
    }
 }