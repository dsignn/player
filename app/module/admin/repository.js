/**
 * Monitor repository
 */
import {ContainerAware} from "@dsign/library/src/container/ContainerAware.js";
import {OsUtilsService} from "../../src/os/OsUtilsService.js"
import {machineId} from 'node-machine-id';
import {config} from './config';
import { PingDeviceService } from "./src/PingDeviceService.js";
import { XmlhAdapter } from "@dsign/library/src/storage/adapter/xmlh/XmlhAdapter.js";
import { JsonDecode } from "@dsign/library/src/data-transform/JsonDecode.js";
import { DefaultBuilder } from "@dsign/library/src/storage/adapter/xmlh/url/DefaultBuilder.js";
import { JsonEncode } from "@dsign/library/src/data-transform/JsonEncode.js";
import { Storage } from "@dsign/library/src/storage/Storage.js";
import { AuthService } from "./../../src/auth/AuthService.js";

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
        this.initStorageDevice();
        this.initPingService();
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

    /**
     * Storage
     */
    initStorageDevice() {

        let adapterStorage = new XmlhAdapter(
            this._getModuleConfig()['deviceStorage'].adapter.xmlHttp.url,
            this._getModuleConfig()['deviceStorage'].adapter.xmlHttp.collection,
            new JsonEncode(),
            new JsonDecode(),
            new DefaultBuilder()
        );

        adapterStorage.addHeader('Content-Type', 'application/json')
            .addHeader('Accept', 'application/json');

        if (this.getContainer().get('Auth') && this.getContainer().get('Auth').getOrganizationToken()) {
            adapterStorage.addHeader('Authorization', `Bearer ${this.getContainer().get('Auth').getOrganizationToken()}`);


            this.getContainer().get('Auth').getEventManager().on(
                AuthService.LOADED_ORGANIZATION_FROM_TOKEN, 
                () => {
                    adapterStorage.addHeader('Authorization', `Bearer ${this.getContainer().get('Auth').getOrganizationToken()}`);
                }
            )
    
            this.getContainer().get('Auth').getEventManager().on(
                AuthService.RESET_ORGANIZATION_FROM_TOKEN, 
                () => {
                    adapterStorage.removeHeader('Authorization');
                }
            )
        }

        let storage = new Storage(adapterStorage);
        this.getContainer().set(this._getModuleConfig().deviceStorage['name-service'], storage);
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

    initPingService() {

        // TODO aggiungere caricamento dei servizi per i diversi contesti dashboard e player

        if(!this.getContainer().get('Auth')) {
            return;
        }

        this.getContainer().set(
            'PingDeviceService',
            new PingDeviceService(
                this.getContainer().get('Auth'),
                this.getContainer().get(this._getModuleConfig().deviceStorage['name-service']),
                this.getContainer().get(this._getModuleConfig().machineService),
                this.getContainer().get('StorageContainerAggregate').get('ConfigStorage'),
            )
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
