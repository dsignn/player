
class DexieMonitorAdapter extends require("@dsign/library").storage.adapter.dexie.DexieAdapter  {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let collection = super.filter(filter);
        if (filter !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'enable':
                        collection = this.manager.table(this.nameCollaction).where(property).equals(filter[property]);
                        break;
                    case 'name':
                        collection = this.manager.table(this.nameCollaction).where(property).startsWithIgnoreCase(filter[property]);
                        break;
                }
            }
        }

        return collection;
    }
}

module.exports = DexieMonitorAdapter;
