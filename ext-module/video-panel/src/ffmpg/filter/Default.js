const Default = (async () => {        

    /**
     *
     */
    class Default {

        /**
         * @return {string}
         */
        toString() {
            return 'setpts=PTS-STARTPTS';
        }
    }
    return {Default: Default};
})();

export default Default;
export const then = Default.then.bind(Default);