/**
 *
 */
class Mosaic {

    /**
     * @param defaultFilter
     */
    constructor(defaultFilter = new Default()) {

        /**
         * @type {Object}
         * @private
         */
        this._basePanel = {};

        /**
         * @type {Object}
         */
        this._destination = {};

        /**
         * @type {Array}
         * @private
         */
        this._resourceDestination = [];

        /**
         * @type {number}
         * @private
         */
        this._index = 0;

        /**
         * @type {Array}
         * @private
         */
        this._complexFilterFilter = [];

        /**
         * @type {Array}
         * @private
         */
        this._complexFilterOverlay = [];

        /**
         * @type {Default}
         */
        this.defaultFilter = defaultFilter;
    }

    /**
     * @param path
     * @param name
     * @param extension
     * @return {Mosaic}
     */
    setDestination(path, name, extension = 'mp4') {

        this._destination = {
            path : path,
            name : name,
            extension : extension
        };

        return this;
    }

    /**
     *
     * @param {Number} width
     * @param {Number}height
     * @param {string} backgroundColor
     * @param {null|Number} duration
     * @return {Mosaic}
     */
    setBasePanel(width, height, backgroundColor = 'black', duration = null) {

        this._basePanel = {
            height : height,
            width : width,
            backgroundColor : backgroundColor,
            duration : duration
        };

        return this;
    }

    /**
     * @param {GenericFile} resource
     * @param {Number} x
     * @param {Number} y
     * @param filter
     */
    addResource(resource, x, y, filter = null) {

        filter = filter === null ? this.defaultFilter : filter;

        this._resourceDestination.push(resource.getPath());
        this._appendFilterComplexFilter(filter.toString());
        this._appendOverlayComplexFilter(x, y);
        this._index++;
    }

    /**
     * @return {string}
     * @private
     */
    _getBasePanelString() {

        let computedDuration = this._basePanel.duration === undefined ? '' : `:duration=${this._basePanel.duration}`;
        return `color=s=${this._basePanel.width}x${this._basePanel.height}:c=${this._basePanel.backgroundColor}${computedDuration} [base0]`;
    }

    /**
     * @return {string}
     * @private
     */
    _getDestinationString() {
        return `${this._destination.path}/${this._destination.name}.${this._destination.extension}`;
    }

    /**
     * @param x
     * @param y
     */
    _appendOverlayComplexFilter(x, y) {
        this._complexFilterOverlay.push({
            filter: 'overlay',
            options:  { shortest:1, x: x, y:  y},
            inputs: [`base${this._index}`, `filter${this._index}`],
            outputs: `base${this._index + 1}`
        });
    }

    /**
     * @param filter
     */
    _appendFilterComplexFilter(filter) {
        this._complexFilterFilter.push({
            filter: filter,
            inputs: `${this._index}:v`,
            outputs: `filter${this._index}`
        });
    }

    /**
     * @return {Array}
     * @private
     */
    _getComplexFilter() {
        let complexFilter = [];
        /**
         * Add base filter
         */
        complexFilter.push(this._getBasePanelString());

        for (let cont = 0; this._complexFilterFilter.length > cont; cont++) {
            complexFilter.push(this._complexFilterFilter[cont]);
        }

        for (let cont = 0; this._complexFilterOverlay.length > cont; cont++) {
            complexFilter.push(this._complexFilterOverlay[cont]);
        }

        console.log('COMPLEX FILTER', complexFilter);
        return complexFilter;
    }

    /**
     *
     */
    generate() {
        let ffmpeg = require('fluent-ffmpeg');
        let command = new ffmpeg();

        for (let cont = 0; this._resourceDestination.length > cont; cont++) {
            command.addInput('/home/bastoni/Project/dsign/player/app/' + this._resourceDestination[cont]);
        }
        console.log('END', `base${this._index}`);
        command
            .complexFilter(
                this._getComplexFilter(),
                `base${this._index}`
            ).save(
                this._getDestinationString()
            ).on(
                'error',
                (err) => {
                    console.log(err.message);
                }
            ).on(
                'progress',
                (data) => {console.log('Progress', data)}
            ).on(
                'end',
                (data) => {
                    console.log('Complete', data);
                }
            );
    }
}

module.exports = Mosaic;