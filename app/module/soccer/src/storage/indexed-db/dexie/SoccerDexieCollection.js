/**
 *
 */
class SoccerDexieCollection extends require('dsign-library').storage.adapter.DexieCollection {

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
                    case 'enable':
                        collection = table.where(property).equals(search[property]);
                        break;
                }
            }
        }

        return collection;
    }
}

module.exports = SoccerDexieCollection;