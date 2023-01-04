const DexieVideoPanelResourceAdapter = (async () => {         
  
    const { DexieAdapter } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/dexie/DexieAdapter.js`));

    /**
     * @class DexieVideoPanelAdapter
     */
    class DexieVideoPanelResourceAdapter extends DexieAdapter {

         /**
         * @param filter
         * @return {*}
         * @private
         */
          filter(filter) {
            let collection = super.filter(filter);
            if (search !== null && typeof filter === 'object') {
    
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
    return {DexieVideoPanelResourceAdapter: DexieVideoPanelResourceAdapter};
})();

export default DexieVideoPanelResourceAdapter;
export const then = DexieVideoPanelResourceAdapter.then.bind(DexieVideoPanelResourceAdapter);