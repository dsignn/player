/**
 *
 */
class DexieTimeslotAdapter extends require("@dsign/library").storage.adapter.dexie.DexieAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let collection = super.filter(filter);
        if (filter !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'tags':
                        for (let cont = 0; filter[property].length > cont; cont++) {
                            if (cont === 0) {
                                collection = this.manager.table(this.nameCollaction).where(property).equals(filter[property][cont]);
                            } else {
                                collection = collection.or(property).equals(filter[property][cont]);
                            }
                        }
                        break;
                    case 'name':
                        collection = this.manager.table(this.nameCollaction).where(property).startsWithIgnoreCase(filter[property]);
                        break;
                    case 'parentId':
                        collection = this.manager.table(this.nameCollaction).where('monitorContainerReference.parentId').equals(filter[property]);
                        break;
                    case 'parentId+name':
                        collection = this.manager.table(this.nameCollaction)
                            .where('monitorContainerReference.parentId')
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
