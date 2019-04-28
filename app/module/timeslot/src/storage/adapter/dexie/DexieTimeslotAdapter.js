/**
 *
 */
class DexieTimeslotAdapter extends require("@p3e/library").storage.adapter.dexie.DexieAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let collection = super.filter(filter);
        if (filter !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'tags':
                        collection = this.manager.table(this.nameCollaction).where(property).equals(filter[property]);
                        break;
                    case 'name':
                        collection = this.manager.table(this.nameCollaction).where(property).startsWithIgnoreCase(filter[property]);
                        break;
                    case 'monitorId':
                        collection = this.manager.table(this.nameCollaction).where('virtualMonitorReference.monitorId').equals(filter[property]);
                        break;
                    case 'monitorId+name':
                        collection = this.manager.table(this.nameCollaction)
                            .where('virtualMonitorReference.monitorId')
                            .equals(filter[property][0])
                            .and(function(timeslot) {
                                return timeslot.name.search(new RegExp(filter[property][1], 'i')) > -1
                            });
                        break;
                }
            }
        }

        return collection;
    }
}

module.exports = DexieTimeslotAdapter;