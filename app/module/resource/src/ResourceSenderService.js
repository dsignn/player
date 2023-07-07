import { AbstractResourceSenderService } from "./AbstractResourceSenderService";
/**
 * @class ResourceSenderService
 */
export class ResourceSenderService extends AbstractResourceSenderService {

    /**
     * @param {Storage} resourceStorage
     * @param {Timer} timer
     * @param {AbstractSender} sender
     * @param {ContainerAggregate} dataInjectorManager
     */
    constructor(resourceStorage, timer, sender, dataInjectorManager) {

        super(resourceStorage, timer, sender, dataInjectorManager);

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

            switch (true) {
                case this.runningResources[property].rotation === FileEntity.ROTATION_LOOP && this.runningResources[property].getDuration() <= this.runningResources[property].getCurrentTime():
                    this.runningResources[property].reset()
                    this.play(this.runningResources[property]);
                    break;
                case this.runningResources[property].getDuration() <= this.runningResources[property].getCurrentTime():
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

            if (this.runningResources[property].rotation !== FileEntity.ROTATION_INFINITY) {
                this.runningResources[property].setCurrentTime(
                    parseFloat(this.runningResources[property].getCurrentTime() + 0.1).toFixed(1)
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
     * The resourceReference is the resource entity
     * 
     * @param {ResourceSenderEntity} entity 
     */
    _setRunningResource(entity) {
        this.runningResources[`${entity.monitorContainerReference.id}-${entity.resourceReference.context}`];
    }

    /**
     * The resourceReference is the resource entity
     * 
     * @param {ResourceSenderEntity} entity 
     */
    _getRunningResource(entity) {
        return  this.runningResources[`${entity.monitorContainerReference.id}-${entity.resourceReference.context}`];
    }

    /**
     * @param {ResourceSenderEntity} entity
     * @return {Promise}
     */
     async play(entity) {

        // TODO Add xternal option?
        let resource = await this._getResourceFromReference(entity);
        if (resource) {
            // TODO warning
            return;
        }

        entity.resourceReference = resource;
        let runningResource = this._getRunningResource(entity);
        if (runningResource && runningResource.resourceReference.id !== entity.resourceReference.id) {
            // TODO PAUSE RESOURCE
        }
        
        this._setRunningResource(entity);
        entity.resourceReference.status = FileEntity.RUNNING;
        if (entity.resourceReference.getDuration() > 0) {
            entity.resourceReference.setCurrentTime(0);
        }

        console.log(entity);
        //let data = await this._synchExtractData(entity);

        this.getEventManager().emit(ResourceSenderService.PLAY, entity);
    }
}
