const DexieTcpSourceAdapter = (async () => {   
    
    const { DexieAdapter } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/DexieAdapter.js`));

    /**
     * @class DexieTcpSourceAdapter
     */
    class DexieTcpSourceAdapter extends DexieAdapter {

        /**
         * @inheritDoc
         */
        filter(filter) {

            let collection = super.filter(filter);
            if (filter !== null && typeof filter === 'object' && Object.entries(filter).length > 0) {

                for (let property in filter) {

                    switch (property) {
                        case 'name':
                            collection = this.manager.table(this.getNameCollection()).where(property).startsWithIgnoreCase(filter[property]);
                            break;
                    }
                }
            }

            return collection;
        }
    }

    return {DexieTcpSourceAdapter: DexieTcpSourceAdapter};
})();

export default DexieTcpSourceAdapter;
export const then = DexieTcpSourceAdapter.then.bind(DexieTcpSourceAdapter);