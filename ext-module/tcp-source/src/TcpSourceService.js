const TcpSourceService = (async () => {
  
    const { EventManagerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/event/EventManagerAware.js`));
    
    const { TcpSourceEntity} = await import(require('path').normalize(
        `${container.get('Application').getAdditionalModulePath()}/tcp-source/src/entity/TcpSourceEntity.js`));
    


    /**
     * @class TcpSourceService
     */
    class TcpSourceService extends EventManagerAware {

        static get REQUEST_ERROR_EVT() { return 'request-error'; }

        static get UPDATE_TCP_SOURCE_EVT() { return 'tcpSource'; }

        constructor(sender, timer) {
            super();

            this._runningTcpSource = {};

            this.timer = timer;

            this.timer.addEventListener('secondsUpdated', (evt)  => {
                this._updateTimeRequest();
            });
        }

        /**
         * 
         * @param {*} source 
         */
        _request(source) {
            
            fetch(`${source.ip}:${source.port}/`)
                .then((response) => response.text())
                .then((body) => {

                    source.status  = TcpSourceEntity.RUNNING;
                    this.getEventManager()
                    .emit(
                        TcpSourceService.UPDATE_TCP_SOURCE_EVT, body
                    );
                })
                .catch((error) => {

                    source.status  = TcpSourceEntity.ERROR;
                    this.getEventManager()
                        .emit(
                            TcpSourceService.REQUEST_ERROR_EVT, {'error': error, 'entity': source}
                    );
                }); 
        }

        /**
         * @param {*} source 
         * @returns bool
         */
        _isRunning(source) {
            return !!this._runningTcpSource[source.getId()];
        }

        /**
         * 
         */
        _updateTimeRequest() {

            Object.values(this._runningTcpSource).forEach(source => {
                source.currentTime++;
                if (source.currentTime >= source.interval) {
                    this._request(source);
                    source.currentTime = 0;
                }
             
            });
        }


        /**
         * @param {*} source 
         */
        play(source) {
            if (this._isRunning(source)) {
                return;
            }

            this._runningTcpSource[source.getId()] = source;
            source.status = TcpSourceEntity.RUNNING;
            this._request(source);

            this.getEventManager().emit(
                TcpSourceEntity.RUNNING, 
                source
            );
        }

        /**
         * @param {*} source 
         * @returns 
         */
        stop(source) {
     
            if (!this._isRunning(source)) {
                return;
            }
            delete this._runningTcpSource[source.getId()];
            source.status  = TcpSourceEntity.IDLE;

            this.getEventManager().emit(
                TcpSourceEntity.IDLE, 
                source
            );
        }
    }

    return {TcpSourceService: TcpSourceService};
})();

export default TcpSourceService;
export const then = TcpSourceService.then.bind(TcpSourceService);