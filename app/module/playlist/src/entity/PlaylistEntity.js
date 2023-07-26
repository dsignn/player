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
     * @return boolean
     */
    hasMonitorContainer() {
        return this.resources.length > 0;
    }

    /**
     * @return boolean
     */
    getMonitorContainer() {
        return this.resources.length > 0 ? this.resources.monitorContainerReference : null;
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
     * @param {ResourceEntity} timeslot
     * @return {boolean}
     */
    removeResource(resource) {
        //  TODO remove all timeslot with this id
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
     * @param {Number} second
     * @return {PlaylistEntity}
     */
    setSecond(second) {
        if(second < 1 || second > this.getDuration()) {
            return;
        }

        let index = 0;

        for (let cont = 0; this.resources.length > cont; cont++) {
            let durationResource = this.resources[cont].duration;
            if (second > durationResource) {
                second = second - durationResource;
                index++;
            } else {

                this.current().reset();
                this.resources[cont].currentTime = second;
                this.currentIndex = index;
                break;
            }
        }
        return this;
    }

    /**
     * @return {string|null}
     */
    getMonitorId() {
        let monitorId = null;
        if (this.resources.length > 0) {
            monitorId = this.resources[0].monitorContainerReference.id;
        }
        return monitorId
    }

    /**
     *
     * @param name
     * @return {*}
     */
    getOption(name) {
        let option = null;
        if (this.options && typeof this.options === 'object' && this.options[name]) {
            option = this.options[name];
        }
        return option;
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