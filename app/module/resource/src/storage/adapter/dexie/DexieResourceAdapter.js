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

        
        if (filter !== null && typeof filter === 'object') {

            switch (true) {

                case filter.name !== undefined && filter.type !== undefined:
                
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and((element) => {
                                
                                if (element.type === filter.type) {
                                  
                                    return element;
                                } else {
                                    return null;
                                }
                            });
                    break;
                
                case filter.name !== undefined && filter.type !== undefined:
                    console.log('name', 'type');
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and((element) => {
                                
                                if (element.type === filter.type) {
                                  
                                    return element;
                                } else {
                                    return null;
                                }
                            });
                    break;

                case filter.name !== undefined:
                    console.log('name');
                    collection = this.manager.table(this.getNameCollection()).where('name').startsWithIgnoreCase(filter.name);
                    break;
                case filter.type !== undefined:
                    console.log('type');
                    collection = this.manager.table(this.getNameCollection()).where('type').equals(filter.type);
                    break;
                /*
                case 'size':          
                    collection = this.manager.table(this.getNameCollection()).where(property).belowOrEqual(typeof filter[property] == 'string' ? Number(filter[property]) : filter[property]);
                    break;
                case 'tags':
                    collection = this.manager.table(this.getNameCollection()).where(property).anyOf(filter[property]);
                    break;
                */
            }
        }
        

       
        return collection;
    }
}
