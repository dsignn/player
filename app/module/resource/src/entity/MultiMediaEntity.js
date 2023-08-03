import { EntityIdentifier } from "@dsign/library/src/storage/entity/EntityIdentifier";
import { VideoEntity } from './VideoEntity';
import { AudioEntity } from './AudioEntity';
import { PlayerPropertyAwareMixin } from './mixin/PlayerPropertyAwareMixin';
import { MonitorPropertyAwareMixin } from './../../../monitor/src/entity/mixin/MonitorPropertyAwareMixin';

/**
 * @class MultiMediaEntity
 */
export class MultiMediaEntity extends MonitorPropertyAwareMixin(PlayerPropertyAwareMixin(EntityIdentifier)) {

    constructor() {
        super();

        this.resources = [];

        /**
         * @type {Array}
         */
        this.tags = [];
    }

    /**
     * @return {number}
     */
    getDuration() {
        for (let cont = 0; this.resources.length > cont; cont++) {
            if ((this.resources[cont] instanceof VideoEntity) || (this.resources[cont] instanceof AudioEntity)) {

                this.duration = this.resources[cont].duration;
                break;
            }
        }
        return this.duration;
    }

    /**
     * @returns array
     */
    getResources() {
        return this.resources;
    }

    /**
     * @param {*} currentTime 
     */
    setCurrentTime(currentTime) {
        for (let cont = 0; this.resources.length > cont; cont++) {
            this.resources[cont].setCurrentTime(currentTime);
        }
    }
}