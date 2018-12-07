/**
 *
 */
class Mosaic {

    /**
     * @param {Monitor} monitor
     * @param {SidelineMosaicWrapper} sidelineMosaicWrapper
     * @param backgroundColor
     */
    constructor(monitor, sidelineMosaicWrapper, backgroundColor = 'black') {

        let ffmpeg = require('fluent-ffmpeg');
        this.command = new ffmpeg();

        /**
         * @type {Monitor}
         * @private
         */
        this._monitor = monitor;

        /**
         * @type {SidelineMosaicWrapper}
         * @private
         */
        this._sidelineMosaicWrapper= sidelineMosaicWrapper;

        /**
         * @type String
         */
        this.backgroundColor = backgroundColor;

        /**
         * @type {number}
         * @private
         */
        this._index = 0;

        /**
         * @type {Array}
         * @private
         */
        this._complexFilter = [
            `color=s=${this._monitor.width}x${this._monitor.width}:c=${this.backgroundColor}:d=15 [base${this._index}]`
        ];
    }

    /**
     * @param resource
     * @param sideline
     */
    addResource(resource, sideline) {

        
        console.log('dentro',resource, sideline);
    }

    /**
     * @param sideline
     */
    isFilled(sideline) {

    }

    /**
     *
     */
    generate() {

        this.command
            .complexFilter(this._complexFilter, `base${this._index}`)
            .save('test/TONI.mp4')
            .on('error', function(err) {
                console.log(err.message);
            })
            .on('progress', () =>{
                console.log('in progress')
            })
            .on('end', function(data) {
                console.log('complete');
            });
    }

}

module.exports = Mosaic;