/**
 * Monitor repository
 */
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {OsUtilsService} from "../../src/os/OsUtilsService.js"
import {machineId} from 'node-machine-id';
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
        this.initMachineService();
        this.initAcl();
    }

    /**
     * @returns Object
     */
    _getModuleConfig() {
        return  this.getContainer().get('ModuleConfig')['admin']['admin'];
    }

    /**
     * Merge config
     */
    loadConfig() {
        this.getContainer().set(
            'ModuleConfig',
            this.getContainer().get('merge').merge(this.getContainer().get('ModuleConfig'), config)
        );
    }


    initMachineService() {
        this.getContainer()
            .set( 
                this._getModuleConfig().machineService,
                new OsUtilsService(
                    require('os'),
                    machineId)
            );
    }

    /**
     * Acl
     */
    initAcl() {

        let aclService = this.getContainer().get('Acl');
        let resource = this.getContainer().get('ModuleConfig')['admin']['admin'].acl.resource;

        aclService.addResource(resource);
        aclService.allow('admin', resource);
        aclService.allow('guest', resource);
        // guest
    }
}
