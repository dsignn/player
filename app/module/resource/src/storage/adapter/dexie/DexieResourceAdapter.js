import {DexieAdapter} from '@dsign/library/src/storage/adapter/dexie/DexieAdapter';

/**
 * @class DexieResourceAdapter
 */
export class DexieResourceAdapter extends DexieAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let collection = super.filter(filter);
        if (search !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'tags':
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
