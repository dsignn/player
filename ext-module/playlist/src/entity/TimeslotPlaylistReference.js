import {EntityReference} from "@dsign/library/src/storage/entity/EntityReference";

/**
 *
 */
export class TimeslotPlaylistReference extends EntityReference {

    /**
     * @return {number}
     */
    getDuration() {
        return parseInt(this.duration);
    }

    /**
     * @return {number}
     */
    getCurrentTime() {
        return parseFloat(this.currentTime);
    }

    /**
     *
     */
    reset() {
        this.currentTime = 0;

    }
}
