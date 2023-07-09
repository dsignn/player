import { EntityIdentifier } from "@dsign/library/src/storage/entity/EntityIdentifier";
import { BindMixin } from "./mixin/BindMixin";

/**
 * @class ResourceSenderEntity
 */
 export class ResourceSenderEntity extends BindMixin(EntityIdentifier) {

    constructor() {
        super();

        this.monitorContainerReference = {};

        this.resourceReference = {};
    }
 }