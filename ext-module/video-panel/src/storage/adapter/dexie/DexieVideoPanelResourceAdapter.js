const DexieVideoPanelResourceAdapter = (async () => {         
  
    const { DexieAdapter } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/DexieAdapter.js`));

    /**
     * @class DexieVideoPanelAdapter
     */
    class DexieVideoPanelResourceAdapter extends DexieAdapter {

        /**
         * @param {Table} table
         * @param search
         * @return {*}
         * @private
         */
        _search(table, search) {

            let collection = table.toCollection();
            if (search !== null && typeof search === 'object') {

                for (let property in search) {

                    switch (property) {
                        case 'name':
                            collection = table.where(property).startsWithIgnoreCase(search[property]);
                            break;
                    }
                }
            }

            return collection;
        }
    }
    return {DexieVideoPanelResourceAdapter: DexieVideoPanelResourceAdapter};
})();

export default DexieVideoPanelResourceAdapter;
export const then = DexieVideoPanelResourceAdapter.then.bind(DexieVideoPanelResourceAdapter);