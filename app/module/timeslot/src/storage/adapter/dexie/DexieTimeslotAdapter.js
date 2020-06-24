import {DexieAdapter} from '@dsign/library/src/storage/adapter/dexie/DexieAdapter';

/**
 * @class DexieTimeslotAdapter
 */
export class DexieTimeslotAdapter extends DexieAdapter {

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
                                collection = this.manager.table(this.getNameCollection()).where(property).equals(filter[property][cont]);
                            } else {
                                collection = collection.or(property).equals(filter[property][cont]);
                            }
                        }
                        break;
                    case 'name':
                        collection = this.manager.table(this.getNameCollection()).where(property).startsWithIgnoreCase(filter[property]);
                        break;
                    case 'parentId':
                        let attribute = 'monitorContainerReference.id';
                        switch (true) {
                            case Array.isArray(filter[property]) === true:
                                for (let cont = 0; filter[property].length > cont; cont++) {
                                    if (cont === 0) {
                                        collection = this.manager.table(this.getNameCollection()).where(attribute).equals(filter[property][cont].id);
                                    } else {
                                        collection = collection.or(attribute).equals(filter[property][cont].id);
                                    }
                                }
                                break;
                            case typeof filter[property] === 'string':
                                collection = this.manager.table(this.getNameCollection()).where(attribute).equals(filter[property]);
                                break;
                        }
                        break;
                    case 'parentId+name':
                        collection = this.manager.table(this.getNameCollection())
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
