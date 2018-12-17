
DexieCollection = require('../../../../../../lib/storage/indexed-db/dexie/DexieCollection');

class TimeslotDexieCollection extends DexieCollection {

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
                    case 'tags':
                        collection = table.where(property).equals(search[property]);
                        break;
                    case 'name':
                        collection = table.where(property).startsWithIgnoreCase(search[property]);
                        break;
                    case 'monitorId':
                        collection = table.where('virtualMonitorReference.monitorId').equals(search[property]);
                        break;
                    case 'monitorId+name':
                        collection = table.where('virtualMonitorReference.monitorId')
                            .equals(search[property][0])
                            .and(function(timeslot) {
                                return timeslot.name.search(new RegExp(search[property][1], 'i')) > -1
                            });
                        break;
                }
            }
        }

        return collection;
    }
}

module.exports = TimeslotDexieCollection;