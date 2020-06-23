import {DexieAdapter} from "@dsign/library/src/storage/adapter/dexie/DexieAdapter";

/**
 * @class DexieMonitorAdapter
 */
export class DexieMonitorAdapter extends DexieAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let collection = super.filter(filter);
        if (filter !== null && typeof filter === 'object' && Object.entries(filter).length > 0) {

            for (let property in filter) {

                switch (property) {
                    case 'enable':
                        collection = this.manager.table(this.getNameCollection()).where(property).equals(filter[property]);
                        break;
                    case 'name':
                        collection = this.manager.table(this.getNameCollection()).where(property).startsWithIgnoreCase(filter[property]);
                        break;
                }
            }
        }

        return collection;
    }
}
