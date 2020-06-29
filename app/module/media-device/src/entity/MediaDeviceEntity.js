import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";

/**
 * @class MediaDeviceEntity
 */
export class MediaDeviceEntity extends EntityIdentifier {

    static get TYPE_VIDEO() { return 'video'; };

    static get TYPE_AUDIO() { return 'audio'; };

    constructor() {
        super();

        /**
         * @type {string}
         */
        this.deviceId = '';

        /**
         * @type {string}
         */
        this.type = '';

        /**
         * @type {string}
         */
        this.groupId = '';

        /**
         * @type {string}
         */
        this.name = '';

        /**
         * @type {string}
         */
        this.deviceName = '';
    }
}


