/**
 * Monitor repository
 */
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import { FileSystemAdapter } from "@dsign/library/commonjs/storage/adapter/file-system/FileSystemAdapter";
import {Storage} from "@dsign/library/src/storage/Storage";
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
        this.getContainer().set(
            'Config',
            this.getContainer().get('merge').merge(this.getContainer().get('Config'), config)
        );
    }

    /**
     * Acl
     */
    initAcl() {

        let aclService = this.getContainer().get('Acl');
        let resource = this.getContainer().get('Config').modules['admin']['config'].acl.resource;

        aclService.addResource(resource);
        aclService.allow('guest', resource);
        // guest
    }
}
