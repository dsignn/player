const TcpSourceEntity = (async () => {
    const { EntityIdentifier} = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/entity/EntityIdentifier.js`));

    const { JsonParser} = await import(require('path').normalize(
        `${container.get('Application').getAdditionalModulePath()}/tcp-source/src/parser/JsonParser.js`));
        

    /**
     * @class PlaylistEntity
     */
    class TcpSourceEntity extends EntityIdentifier {

        static get RUNNING() { return 'running'; }
        
        static get IDLE() { return 'idle'; }
        
        static get ERROR() { return 'error'; }

        constructor() {
            super();

            /**
             * @type {String}
             */
            this.name = null;

            this.ip = null;

            this.port = null;

            this.interval = 2;

            this.status = TcpSourceEntity.IDLE;

            this.currentTime = 0;

            this.parser = new JsonParser();
        }

        setParser(parser) {
            this.parser = parser;
        }
    }

    return {TcpSourceEntity: TcpSourceEntity};
})();

export default TcpSourceEntity;
export const then = TcpSourceEntity.then.bind(TcpSourceEntity);