/**
 *
 */
class Mosaic {

    /**
     * @param {MonitorMosaic} monitorMosaic
     * @param {PanelResource} panelMosaic
     * @param backgroundColor
     */
    constructor(monitorMosaic, panelMosaic, backgroundColor = 'black') {

        let ffmpeg = require('fluent-ffmpeg');
        this.command = new ffmpeg();

        /**
         * @type {VirtualMonitor}
         * @private
         */
        this._monitorMosaic = monitorMosaic;

        /**
         * @type {PanelResource}
         * @private
         */
        this._panelMosaic= panelMosaic;

        /**
         * @type String
         */
        this.backgroundColor = backgroundColor;

        /**
         * @type {number}
         * @private
         */
        this._filterIndex = 0;

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
         * @type {number}
         * @private
         */
        this._overlayIndex = 0;
    }

    /**
     * @return {MonitorMosaic}
     */
    getMonitorMosaic() {
        return this._monitorMosaic;
    }

    /**
     * @return {PanelMosaic}
     */
    getPanelMosaic() {
        return this._panelMosaic;
    }

    /**
     * @param {ResourceMosaic} resource
     * @param sideline
     */
    addResource(resource, sideline) {

        let wrapSideline = this._panelMosaic.getSideline(sideline.id);
        let wrapMonitor = this._monitorMosaic.getMonitor(wrapSideline.virtualMonitorReference.monitorId);



        if (!wrapMonitor.isProgressOffsets()) {
            this._initializeXY(wrapMonitor.id);
            console.log('INITIALIZE', wrapMonitor);
        }

        while (resource.getRemainingWidth() > 0) {

            switch (true) {
                case resource.getRemainingWidth() > wrapMonitor.getRemainingWidth():
                    this._console('MAGGIORE PRIMA', wrapMonitor, wrapSideline, resource);
                    this.appendResource(resource);
                    this.appendFilterComplexFilter(
                        this._getCropString(wrapMonitor.getRemainingWidth(), wrapSideline.height, wrapMonitor.progressOffsetX, 0)
                    );
                    this.appendOverlayComplexFilter(wrapMonitor.progressOffsetX, wrapMonitor.progressOffsetY);

                    wrapSideline.comutedWidth += wrapMonitor.getRemainingWidth();
                    resource.computedWidth += wrapMonitor.getRemainingWidth();
                    wrapMonitor.progressOffsetY += wrapSideline.height;
                    wrapMonitor.progressOffsetX = wrapMonitor.offsetX;
                    this._console('MAGGIORE DOPO', wrapMonitor, wrapSideline, resource);
                    break;
                case resource.getRemainingWidth() === wrapMonitor.getRemainingWidth():
                    this._console('UGUALE PRIMA', wrapMonitor, wrapSideline, resource);

                    this.appendResource(resource);
                    this.appendFilterComplexFilter(
                        this._getCropString(resource.getRemainingWidth(), wrapSideline.height, wrapMonitor.progressOffsetX, 0)
                    );
                    this.appendOverlayComplexFilter(wrapMonitor.progressOffsetX, wrapMonitor.progressOffsetY);

                    wrapMonitor.progressOffsetX = wrapMonitor.offsetX;
                    wrapMonitor.progressOffsetY += wrapSideline.height;
                    wrapSideline.comutedWidth += resource.getRemainingWidth();
                    resource.computedWidth += resource.getRemainingWidth();
                    this._console('UGUALE DOPO', wrapMonitor, wrapSideline, resource);

                    break;
                case resource.getRemainingWidth() < wrapMonitor.getRemainingWidth():
                    this._console('MINORE PRIMA', wrapMonitor, wrapSideline, resource);
                    this.appendResource(resource);
                    this.appendFilterComplexFilter(
                        this._getCropString(resource.getRemainingWidth(), wrapSideline.height, wrapMonitor.progressOffsetX, 0)
                    );
                    this.appendOverlayComplexFilter(wrapMonitor.progressOffsetX, wrapMonitor.progressOffsetY);
                    wrapSideline.comutedWidth += resource.getRemainingWidth();
                    wrapMonitor.progressOffsetX += resource.getRemainingWidth();
                    resource.computedWidth += resource.getRemainingWidth();
                    this._console('MINORE DOPO', wrapMonitor, wrapSideline, resource);

                    break;
            }
        }
    }

    /**
     *
     * @param label
     * @param {MonitorMosaic} wrapMonitor
     * @param {PanelMosaic} wrapSideline
     * @param {ResourceMosaic} resource
     * @private
     */
    _console(label, wrapMonitor, wrapSideline, resource) {

        console.group(label);
        console.table(
            {
                'Resource remaining width' : resource.getRemainingWidth(),
                'Resource computed width' : resource.computedWidth
            }
        );
        console.table(
            {
                'Monitor height' : wrapMonitor.height,
                'Monitor progress Y' : wrapMonitor.progressOffsetY,
                'Monitor width' : wrapMonitor.width,
                'Monitor progress X' : wrapMonitor.progressOffsetX
            }
        );
        console.table(
            {
                'panel computed width' : wrapSideline.comutedWidth,
                'panel remaining width' : wrapSideline.getRemainingWidth(),
                'panel Height' : wrapSideline.height,
                'panel width' : wrapSideline.width
            }
        );
        console.groupEnd();
    }

    /**
     * @param width
     * @param height
     * @param y
     * @param x
     * @private
     */
    _getCropString(width, height, y, x) {
        return `crop=${width}:${height}:${y}:${x}`;
    }

    /**
     * @param {string} duration (for debug)
     * @return {string}
     * @private
     */
    _getBaseStringComplexFilter(duration) {
        let computedDuration = duration === undefined ? '' : duration;
        return `color=s=${this._monitorMosaic.width}x${this._monitorMosaic.width}:c=${this.backgroundColor}${computedDuration} [base0]`;
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
        complexFilter.push(this._getBaseStringComplexFilter());

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
     * @param {string} id
     * @private
     */
    _initializeXY(id) {

        let wrapMonitor = this._monitorMosaic.getMonitor(id);

        wrapMonitor.progressOffsetX = 0;
        wrapMonitor.progressOffsetY = 0;
        let parent = this._monitorMosaic.getParent(wrapMonitor.id);

        // Retrive parent monitor offset and skip last
        while (this._monitorMosaic.getParent(parent.id)) {
            wrapMonitor.progressOffsetX =+ parent.offsetX;
            wrapMonitor.progressOffsetY =+ parent.offsetY;
            parent = this._monitorMosaic.getParent(parent.id);
        }

        let monitor = this._monitorMosaic.getMonitor(wrapMonitor.id);

        wrapMonitor.progressOffsetX =+ monitor.offsetX;
        wrapMonitor.progressOffsetY =+ monitor.offsetY;
    }

    /***
     * @param {ResourceMosaic} resource
     */
    appendResource(resource) {
        this.command.addInput(resource.getPath());
    }

    /**
     * @param filter
     */
    appendFilterComplexFilter(filter) {
        this._complexFilterFilter.push({
            filter: filter,
            inputs: `${this._filterIndex}:v`,
            outputs: `filter${this._filterIndex}`
        });
        this._filterIndex++;
    }

    /**
     * @param x
     * @param y
     */
    appendOverlayComplexFilter(x, y) {
        this._complexFilterOverlay.push({
            filter: 'overlay',
            options:  { shortest:1, x: x, y:  y},
            inputs: [this._overlayIndex !== 0 ? `overlay${this._overlayIndex}` : 'base0', `filter${this._filterIndex - 1}`],
            outputs: `overlay${this._overlayIndex + 1}`
        });
        this._overlayIndex++;
    }

    /**
     *
     */
    generate() {

        this.command
            .complexFilter(
                this._getComplexFilter(),
                `overlay${this._overlayIndex}`
            )
            .save('test/TONI.mp4')
            .on('error', function(err) {
                console.error(err);
            })
            .on('progress', () =>{
                console.log('in progress')
            })
            .on('end', function(data) {
                console.log('complete');
            });
    }

    static _test() {
        this.ffmpeg = require('fluent-ffmpeg');
        let command = new this.ffmpeg();
        let complexFilter = [];
        let backgroundColor = 'black';
        complexFilter.push(`color=s=${8640}x${90}:c=${backgroundColor} [base0]`);

        complexFilter.push({
            filter: 'setpts=PTS-STARTPTS',
            inputs: `${0}:v`, outputs: `block${0}`
        });

        complexFilter.push({
            filter: 'setpts=PTS-STARTPTS',
            inputs: `${1}:v`, outputs: `block${1}`
        });

        complexFilter.push({
            filter: 'setpts=PTS-STARTPTS',
            inputs: `${2}:v`, outputs: `block${2}`
        });

        complexFilter.push({
            filter: 'overlay', options: { shortest:1, x: 0, y:  0},
            inputs: [`base${0}`, `block${0}`], outputs: `base${1}`
        });

        complexFilter.push({
            filter: 'overlay', options: { shortest:1, x: 2880, y:  0},
            inputs: [`base${1}`, `block${1}`], outputs: `base${2}`
        });

        complexFilter.push({
            filter: 'overlay', options: { shortest:1, x: 5760, y:  0},
            inputs: [`base${2}`, `block${2}`], outputs: `base${3}`
        });
        console.log('COMPLEX FILTER', complexFilter);

        command = command.addInput('test/2880x90.mp4');
        command = command.addInput('test/2880x90.mp4');
        command = command.addInput('test/2880x90.mp4');


        command
            .complexFilter(complexFilter, 'base3')
            .save('test/8640x90.mp4')
            .on('error', function(err) {
                console.log(err.message);
            })
            .on('progress', () =>{console.log('default progress')})
            .on('end', function(data) {
                console.log('ok');
            });

    }
}

module.exports = Mosaic;