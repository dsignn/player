
/**
 * Config file to load services
 */
class AdminConfig extends require("@dsign/library").container.ContainerAware {
            
    init() {

        this.initAcl();
        console.log('Init admin');
    }

    /**
     *
     */
    initAcl() {

        if (this.getContainer().has('Acl')) {

            let aclService = this.getContainer().get('Acl');

            // TODO add method on service
            aclService.adapter.acl.addResource('admin');
            aclService.adapter.acl.allow('admin', 'admin');
        }
    }
}

module.exports = AdminConfig;
