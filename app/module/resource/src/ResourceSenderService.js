import { AbstractResourceSenderService } from "./AbstractResourceSenderService";
import { FileEntity } from "./entity/FileEntity";
/**
 * @class ResourceSenderService
 */
export class ResourceSenderService extends AbstractResourceSenderService {

    /**
     * @param {Storage} resourceStorage
     * @param {Timer} timer
     * @param {ContainerAggregate} dataInjectorManager
     */
    constructor(resourceStorage, timer, dataInjectorManager, resourceSenderStorage) {

        super(resourceStorage, timer, dataInjectorManager);

        this.resourceSenderStorage = resourceSenderStorage;

        /**
         * List running resources
         * @type {Object}
         */
        this.runningResources = {};

        /**
         * Timer to schedule the time the TIK
         */
        this.timer.addEventListener('secondTenthsUpdated', (evt) => {
            this._schedule();
        });
    }

    /**
     * @param {CustomEvent} evt 
     */
    _updateResourceSender(evt) {

        if (evt.data.resource.resourceReference.context === FileEntity.CONTEXT_DEFAULT) {
            return;
        }

        this.resourceSenderStorage.update(evt.data.resource)
            .then((entity) => {
                //console.log('service update', evt.name);
            })
    }

    /**
     * @private
     */
    _schedule() {

        this._scheduleRunningResources();
        this._updateRunningResources();
    }


    /**
     * @private
     */
    _scheduleRunningResources() {
        for (let property in this.runningResources) {

            let resource = this.runningResources[property].resourceReference;

            switch (true) {
                case resource.getDuration() < 0:
                    break;
                case resource.getRotation() === FileEntity.ROTATION_LOOP && resource.getDuration() <= resource.getCurrentTime():
                    this.runningResources[property].reset()
                    this.play(this.runningResources[property]);
                    break;
                case resource.getDuration() <= resource.getCurrentTime():
                    this.stop(this.runningResources[property]);
                    break;
            }
        }
    }

    /**
     * @private
     */
    _updateRunningResources() {

        for (let property in this.runningResources) {

            let resource = this.runningResources[property].resourceReference;

            if (resource.getRotation() !== FileEntity.ROTATION_INFINITY || resource.getDuration() > 0) {
                resource.setCurrentTime(
                    parseFloat(resource.getCurrentTime() + 0.1).toFixed(1)
                );
            }

            this.getEventManager().emit(ResourceSenderService.UPDATE_TIME, this.runningResources[property]);
        }
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @return {Promise}
     */
    async _getResourceFromReference(entity) {
        let resource = await this.resourceStorage.get(entity.resourceReference.id);
        if ((resource instanceof MultiMediaEntity)) {
            for (let cont = 0; resource.resources.length > cont; cont++) {
                let tmpResource = await this.resourceStorage.get(resource.resources[cont].id);
                if (tmpResource) {
                    resource.resources[cont] = tmpResource;
                }
            }
        }
        return resource;
    }

    /**
     * The ResourceSenderEntity
     * 
     * @param {ResourceSenderEntity} entity 
     */
    _setRunningResource(entity) {
        this.runningResources[`${entity.monitorContainerReference.id}-${entity.resourceReference.context}`] = entity;
    }

    /**
     * The entity.resourceReference is the "ResourceEntity"
     * 
     * @param {ResourceSenderEntity} entity 
     */
    _removeRunningResource(entity) {
        let context = [`${entity.monitorContainerReference.id}-${entity.resourceReference.context}`];
        if (this.runningResources[context] && this.runningResources[context].resourceReference.id === entity.resourceReference.id) {
            delete this.runningResources[context];
        }
    }

    /**
     * The resourceReference is the resource entity
     * 
     * @param {ResourceSenderEntity} entity 
     */
    _getRunningResource(entity) {
        return this.runningResources[`${entity.monitorContainerReference.id}-${entity.resourceReference.context}`];
    }

    /**
     * 
     * @param {ResourceSenderEntity} entity 
     * @returns bool
     */
    _hasRunningResource(entity) {
        return !!this._getRunningResource(entity);
    }

    /**
     * @param {array} binds 
     * @param {string} method 
     */
    _scheduleBinds(binds, method) {
        for (let cont = 0; binds.length > cont; cont++) {

            this.resourceSenderStorage.get(binds[cont].id)
                .then((resourceSender) => {
                    console.log('DIO CANE', resourceSender);
                    this[method](resourceSender);
                })
                .catch((err) => {
                        console.error('Error bind resource service', err)
                    });
        }
    }

    /**
     * @param {*} monitor 
     * @param {*} layer 
     */
    clearLayer(monitor, layer) {
        this.emitResourceEvt(ResourceSenderService.CLEAR_LAYER, monitor, {'layer': layer});
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @return {Promise}
     */
    async play(entity) {

        // TODO Add xternal option?
        let resource = await this._getResourceFromReference(entity);
        if (!resource) {
            // TODO warning
            return;
        }

        entity.resourceReference = Object.assign(resource, entity.resourceReference);
        let runningResource = this._getRunningResource(entity);
        if (runningResource && runningResource.resourceReference.id !== entity.resourceReference.id) {
            this.pause(runningResource);
        }

        this._setRunningResource(entity);
        entity.resourceReference.status = FileEntity.RUNNING;
        if (entity.resourceReference.getDuration() > 0) {
            entity.resourceReference.setCurrentTime(0);
        }
        /**
         * Recover metadata
         */
        let data = await this._extractData(entity.resourceReference);
        /**
         * Binds
         */
        if (entity.getBinds().length > 0) {
            this._scheduleBinds(entity.getBinds(), 'play');
        }

        this.emitResourceEvt(ResourceSenderService.PLAY, entity, data);
        //TODO save storage
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @return {Promise}
     */
    async pause(entity) {


        let runningResource = this._getRunningResource(entity);
        if (!runningResource) {
            return;
        }

        this._removeRunningResource(entity);
        runningResource.resourceReference.status = FileEntity.PAUSE;

        /**
         * Binds
         */
        if (entity.getBinds().length > 0) {
            this._scheduleBinds(entity.getBinds(), 'pause');
        }

        this.emitResourceEvt(ResourceSenderService.PAUSE, runningResource);
        //TODO save storage
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @return {Promise}
     */
    async resume(entity) {

        // TODO Add xternal option?
        let resource = await this._getResourceFromReference(entity);
        if (!resource) {
            // TODO warning
            return;
        }

        entity.resourceReference = Object.assign(resource, entity.resourceReference);
        let runningResource = this._getRunningResource(entity);
        if (runningResource && runningResource.resourceReference.id !== entity.resourceReference.id) {
            this.pause(runningResource);
        }
        this._setRunningResource(entity);
        entity.resourceReference.status = FileEntity.RUNNING;
        /**
         * Recover metadata
         */
        let data = await this._extractData(entity.resourceReference);

        /**
         * Binds
         */
        if (entity.getBinds().length > 0) {
            this._scheduleBinds(entity.getBinds(), 'resume');
        }

        this.emitResourceEvt(ResourceSenderService.RESUME, entity, data);
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @return {Promise}
     */
    async stop(entity) {

        let runningResource = this._getRunningResource(entity);
        if (!runningResource) {
            entity.resourceReference.status = FileEntity.IDLE;
            entity.resourceReference.setCurrentTime(0);
            this.emitResourceEvt(ResourceSenderService.STOP, entity);
            return;
        }

        this._removeRunningResource(entity);
        runningResource.resourceReference.status = FileEntity.IDLE;
        runningResource.resourceReference.setCurrentTime(0);

        /**
         * Binds
         */
        if (entity.getBinds().length > 0) {
            this._scheduleBinds(runningResource.getBinds(), 'stop');
        }

        this.emitResourceEvt(ResourceSenderService.STOP, runningResource);
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @param {second} second
     * @returns {Promise<void>}
     */
    async changeTime(entity, second) {

        let runningResource = this._getRunningResource(entity);

        if (!runningResource) {
            console.warn('Resource not running', entity, second);
            return;
        }

        if (runningResource.resourceReference.getDuration() <= second) {
            console.warn('Duration of resource to short', entity, second);
           
            runningResource.resourceReference.setCurrentTime(
                runningResource.resourceReference.getDuration()
            );

            this.emitResourceEvt(
                ResourceSenderService.CHANGE_TIME,
                runningResource
            );
            return;
        }

        runningResource.resourceReference.setCurrentTime(second);

        this.emitResourceEvt(
            ResourceSenderService.CHANGE_TIME,
            runningResource
        );

        for (let cont = 0; runningResource.binds.length > cont; cont++) {

            this.resourceSenderStorage.get(runningResource.binds[cont].id)
                .then((resourceSender) => {
                    console.log('DIO CANE', resourceSender);
                    this.changeTime(resourceSender ,second);
                })
                .catch((err) => {
                        console.error('Error bind resource service', err)
                    });
        }
    }
}
