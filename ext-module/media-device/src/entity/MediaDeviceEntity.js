const MediaDeviceEntity = (async () => { 

    const { EntityIdentifier } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));
    
    /**
     * @class MediaDeviceEntity
     */
    class MediaDeviceEntity extends EntityIdentifier {

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

    return {MediaDeviceEntity: MediaDeviceEntity};
})();

export default MediaDeviceEntity;
export const then = MediaDeviceEntity.then.bind(MediaDeviceEntity);

