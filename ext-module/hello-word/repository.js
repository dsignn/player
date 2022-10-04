export async function Repository() {
    const { ContainerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/container/ContainerAware.js`));
    const { HelloWordService } = await import('./src/HelloWordService.js');
    const { config } = await import('./config.js');

    /**
     * @class Repository
     */
    return class Repository extends ContainerAware {

        init() {
            this.initConfig();
            this.initService();
            this.initAcl();
        }    

        /**
         * Init config
         */
        initConfig() {
            this.getContainer().set(
                'Config',
                this.getContainer().get('merge').merge(this.getContainer().get('Config'), config)
            );
        }

        initService() {
            this.getContainer()
                .set(
                    'HelloWordService',
                    new HelloWordService()
                    );
        }


        /**
         * Init acl
         */
        initAcl() {
            if (this.getContainer().has('Acl')) {

                let aclService = this.getContainer().get('Acl');
                let resource = this.getContainer().get('Config').modules['hello-word']['hello-word'].acl.resource;
            
                aclService.addResource(resource);
                aclService.allow('guest', resource);
            }
        }
    }   
}