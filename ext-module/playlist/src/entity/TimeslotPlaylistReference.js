const TimeslotPlaylistReference = (async () => {          

    const { EntityReference } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityReference.js`));

    /**
     *
     */
    class TimeslotPlaylistReference extends EntityReference {

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

    return {TimeslotPlaylistReference: TimeslotPlaylistReference};
})();

export default TimeslotPlaylistReference;
export const then = TimeslotPlaylistReference.then.bind(TimeslotPlaylistReference);