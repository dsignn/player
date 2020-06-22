/**
 * Monitor repository
 */
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {config} from './config';

/**
 * @class Repository
 */
export class Repository extends ContainerAware {

    /**
     *
     */
    init() {
        this.loadConfig();
        this.initAcl();
    }

    /**
     * Merge config
     */
    loadConfig() {
        this.container.set(
            'config',
            this.getContainer().get('merge').merge(config, this.getContainer().get('config'))
        );
    }

    /**
     * Acl
     */
    initAcl() {
        let aclService = this.getContainer().get('Acl');

        // TODO add method on service
        aclService.addResource('admin');
        aclService.allow('admin', 'admin');
    }
}
