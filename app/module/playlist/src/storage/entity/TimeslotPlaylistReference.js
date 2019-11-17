/**
 *
 */
class TimeslotPlaylistReference extends require("@dsign/library").storage.entity.EntityReference {

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

module.exports = TimeslotPlaylistReference;
