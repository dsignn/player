
/**
 * Config file to load services
 */
class MediaDeviceConfig extends require("@dsign/library").container.ContainerAware {
            
    init() {

        this.initAcl();
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('media-device');
            aclService.adapter.acl.allow('guest', 'media-device');
        }
    }
}
module.exports = MediaDeviceConfig;
