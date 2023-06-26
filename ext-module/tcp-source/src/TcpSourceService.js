const TcpSourceService = (async () => {
  
    const { EventManagerAware} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/event/EventManagerAware.js`));
    
    const { TcpSourceEntity} = await import(require('path').normalize(
        `${container.get('Application').getAdditionalModulePath()}/tcp-source/src/entity/TcpSourceEntity.js`));
    


    /**
     * @class TcpSourceService
     */
    class TcpSourceService extends EventManagerAware {

        static get REQUEST_ERROR() { return 'request-error'; }

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
                    console.log('Request', body);
                })
                .catch((error) => {

                    source.status  = TcpSourceEntity.ERROR;
                    this.getEventManager()
                        .emit(
                            TcpSourceService.REQUEST_ERROR, 
                            {'error': error, 'entity': source}
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

        /**
         *
         * @param {string} type
         * @param {TimeslotEntity} timeslot
         * @param {Object} data
         * @private
         */
        _send(type, timeslot, data = null) {

            let message = {
                event : type,
                data : {
                    timeslot : timeslot
                }

            };

            if(data) {
                message.data.data = data;
            }
            console.log('SOURCE SEND',message);
            this.sender.send('proxy', message);
        }
    }

    return {TcpSourceService: TcpSourceService};
})();

export default TcpSourceService;
export const then = TcpSourceService.then.bind(TcpSourceService);