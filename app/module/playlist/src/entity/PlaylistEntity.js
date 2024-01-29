import {EntityIdentifier} from "@dsign/library/src/storage/entity/EntityIdentifier";
import {MonitorPropertyAwareMixin} from "./../../../monitor/src/entity/mixin/MonitorPropertyAwareMixin";
import {PlayerPropertyAwareMixin} from "./../../../resource/src/entity/mixin/PlayerPropertyAwareMixin";
import {BindMixin} from "./../../../resource/src/entity/mixin/BindMixin";
import {DurationMixin} from "./../../src/entity/mixin/DurationMixin";
import {ListAwareMixin} from "./../../src/entity/mixin/ListAwareMixin";


/**
 * @class PlaylistEntity
 */
export class PlaylistEntity extends ListAwareMixin(DurationMixin(BindMixin(PlayerPropertyAwareMixin(MonitorPropertyAwareMixin(EntityIdentifier))))) {

    /**
     * @return {string}
     * @constructor
     */
    constructor() {
        super();

        /**
         * @type {String}
         */
        this.name = null;

        /**
         * @type {number}
         */
        this.currentIndex = 0;

        /**
         * @type {Array}
         */
        this.resources = [];

        /**
         * @type {object}
         */
        this.monitorContainerReference = {};
    }

    /**
     * @param {ResourceEntity} resource
     * @return {PlaylistEntity}
     */
    appendResource(resource) {

        this.resources.push(resource);
        return this;
    }

    /**
     *
     * @param {ResourceEntity} resource
     * @return {boolean}
     */
    removeResource(resource) {
        let index = this.resources.findIndex(element => element.id === resource.id);
        if (index > -1) {
            this.resources.splice(index, 1);
        }

        return index > -1;
    }

    /**
     * @param {number} index
     * @return {number}
     */
    removeResourceIndex(index) {
        let search = -1;
        if (this.resources.length > index) {
            search = index;
            this.resources.splice(index, 1);
        }
        return search;
    }

    /**
     *
     * @param {PlaylistEntity} playlist
     * @return {boolean}
     */
    removeBind(playlist) {
        if(playlist.id === this.id) {
            return;
        }

        let index = this.binds.findIndex(element => element.id === playlist.id);
        if (index > -1) {
            this.binds.splice(index, 1);
        }
        return index > -1;
    }

    /**
     * @param {number} seconds 
     */
    setCurrentTime(seconds) {

        if(seconds < 1 || seconds > this.getDuration()) {
            return;
        }

        this.reset();

        for(let cont = 0; this.resources.length > cont; cont++) {
            if (seconds > this.resources[cont].getDuration()) {
                seconds = seconds - this.resources[cont].getDuration()
            } else {
                this.currentIndex = cont;
                this.resources[cont].setCurrentTime(seconds);
                break;
            }
        }
    }

    /**
     * @returns float
     */
    getCurrentTime() {

        let currentTime = 0;
        for(let cont = 0; this.resources.length > cont ; cont++) {


            if (cont === this.currentIndex && this.resources[cont].getCurrentTime) {
                currentTime = currentTime + this.resources[cont].getCurrentTime();
                break;
            } else if (this.resources[cont].getDuration) {
                currentTime = currentTime + this.resources[cont].getDuration();
            }
        }

        return currentTime;
    }

    /**
     * @return {string|number}
     */
    getCurrentTimeString() {
        let currentTime = 0;
        for (let cont = this.currentIndex -1; cont > -1; cont--) {
            currentTime += this.resources[cont].getDuration();
        }

        currentTime += this.current() ? this.current().currentTime : 0;

        currentTime += '';
        switch (true) {
            case currentTime % 1 === 0:
                currentTime = currentTime + '.0';
                break;
        }
        return currentTime;
    }
}