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

                case filter.name !== undefined && 
                     filter.size !== undefined && 
                     filter.width !== undefined && 
                     filter.height !== undefined && 
                     filter.type !== undefined && 
                     filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterType.bind({"dataFilter": filter}))
                        .and(this._andFilterSize.bind({"dataFilter": filter}))
                        .and(this._andFilterWidth.bind({"dataFilter": filter}))
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                        .and(this._andFilterTags.bind({"dataFilter": filter}));
                    break;

                // 5 filter   

                case filter.name !== undefined && 
                     filter.size !== undefined && 
                     filter.width !== undefined && 
                     filter.height !== undefined && 
                     filter.type !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterSize.bind({"dataFilter": filter}))
                        .and(this._andFilterWidth.bind({"dataFilter": filter}))
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                        .and(this._andFilterType.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.size !== undefined && 
                     filter.width !== undefined && 
                     filter.height !== undefined && 
                     filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterSize.bind({"dataFilter": filter}))
                       .and(this._andFilterWidth.bind({"dataFilter": filter}))
                       .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                       .and(this._andFilterTags.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.size !== undefined && 
                     filter.width !== undefined && 
                     filter.type !== undefined && 
                     filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterWidth.bind({"dataFilter": filter}))
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterTags.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.size !== undefined && 
                     filter.height !== undefined && 
                     filter.type !== undefined && 
                     filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterSize.bind({"dataFilter": filter}))
                       .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterTags.bind({"dataFilter": filter}));
                   break;

                // 4 filter 
                
                case filter.name !== undefined && 
                     filter.tags !== undefined && 
                     filter.size !== undefined && 
                     filter.width !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                    .where('name').startsWithIgnoreCase(filter['name'])
                    .and(this._andFilterTags.bind({"dataFilter": filter}))
                    .and(this._andFilterSize.bind({"dataFilter": filter}))
                    .and(this._andFilterWidth.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.tags !== undefined && 
                     filter.size !== undefined && 
                     filter.height !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                    .where('name').startsWithIgnoreCase(filter['name'])
                    .and(this._andFilterTags.bind({"dataFilter": filter}))
                    .and(this._andFilterSize.bind({"dataFilter": filter}))
                    .and(this._andFilterHeigh.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.tags !== undefined && 
                     filter.size !== undefined && 
                     filter.type !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterTags.bind({"dataFilter": filter}))
                        .and(this._andFilterSize.bind({"dataFilter": filter}))
                        .and(this._andFilterType.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.width !== undefined && 
                     filter.height !== undefined && 
                     filter.type !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterWidth.bind({"dataFilter": filter}))
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                        .and(this._andFilterType.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.width !== undefined && 
                     filter.height !== undefined && 
                     filter.size !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterWidth.bind({"dataFilter": filter}))
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                        .and(this._andFilterSize.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.width !== undefined && 
                     filter.height !== undefined && 
                     filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterWidth.bind({"dataFilter": filter}))
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                        .and(this._andFilterTags.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                    filter.type !== undefined && 
                    filter.size !== undefined && 
                    filter.tags !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterSize.bind({"dataFilter": filter}))
                       .and(this._andFilterTags.bind({"dataFilter": filter}));
                   break;

                case filter.name !== undefined && 
                    filter.type !== undefined && 
                    filter.size !== undefined && 
                    filter.width !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterSize.bind({"dataFilter": filter}))
                       .and(this._andFilterWidth.bind({"dataFilter": filter}));
                   break;

                case filter.name !== undefined && 
                     filter.type !== undefined && 
                     filter.size !== undefined && 
                     filter.height !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterType.bind({"dataFilter": filter}))
                        .and(this._andFilterSize.bind({"dataFilter": filter}))
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}));
                    break;
             
                // 3 filter 

                case filter.name !== undefined && 
                    filter.tags !== undefined && 
                    filter.size !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                      .where('name').startsWithIgnoreCase(filter['name'])
                      .and(this._andFilterTags.bind({"dataFilter": filter}))
                      .and(this._andFilterSize.bind({"dataFilter": filter}));
                   break;
            
                case filter.name !== undefined && 
                     filter.width !== undefined && 
                     filter.size !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterWidth.bind({"dataFilter": filter}))
                       .and(this._andFilterSize.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.width !== undefined && 
                     filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterWidth.bind({"dataFilter": filter}))
                        .and(this._andFilterTags.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined && 
                     filter.height !== undefined && 
                    filter.size !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                       .and(this._andFilterSize.bind({"dataFilter": filter}));
                   break;

                case filter.name !== undefined && 
                     filter.height !== undefined && 
                     filter.width !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                        .and(this._andFilterWidth.bind({"dataFilter": filter}));
                    break;
                
                case filter.name !== undefined && 
                     filter.height !== undefined && 
                     filter.tags !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterHeigh.bind({"dataFilter": filter}))
                       .and(this._andFilterTags.bind({"dataFilter": filter}));
                   break;

                case filter.name !== undefined && 
                     filter.type !== undefined && 
                     filter.tags !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterTags.bind({"dataFilter": filter}));
                   break;
                
                case filter.name !== undefined && 
                     filter.type !== undefined && 
                     filter.height !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterHeigh.bind({"dataFilter": filter}));
                   break;
      
                case filter.name !== undefined && 
                     filter.type !== undefined && 
                     filter.size !== undefined:
                   collection = this.manager.table(this.getNameCollection())
                       .where('name').startsWithIgnoreCase(filter['name'])
                       .and(this._andFilterType.bind({"dataFilter": filter}))
                       .and(this._andFilterSize.bind({"dataFilter": filter}));
                   break;

                case filter.name !== undefined && 
                     filter.type !== undefined && 
                     filter.width !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterType.bind({"dataFilter": filter}))
                        .and(this._andFilterWidth.bind({"dataFilter": filter}));
                    break;

                // 2 filter 

                case filter.name !== undefined && filter.tags !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterTags.bind({"dataFilter": filter}));
                    break; 
        
                case filter.name !== undefined && filter.size !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterSize.bind({"dataFilter": filter}));
                    break;    
      
                case filter.name !== undefined && filter.width !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterWidth.bind({"dataFilter": filter}));
                    break;
      
                case filter.name !== undefined && filter.height !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterHeigh.bind({"dataFilter": filter}));
                    break;
                
                case filter.name !== undefined && filter.type !== undefined:
                    collection = this.manager.table(this.getNameCollection())
                        .where('name').startsWithIgnoreCase(filter['name'])
                        .and(this._andFilterType.bind({"dataFilter": filter}));
                    break;

                case filter.name !== undefined:
                    collection = this.manager.table(this.getNameCollection()).where('name').startsWithIgnoreCase(filter.name);
                    break;

                case filter.type !== undefined:
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

    /**
     * @param {object} element 
     * @returns 
     */
    _andFilterType(element) {
        console.log('_andFilterType');
        if (element.type === this.dataFilter.type) {
                                  
            return element;
        } else {
            return null;
        }
    }

    /**
     * @param {object} element 
     * @returns 
     */
    _andFilterHeigh(element) {
        console.log('_andFilterHeigh');
        if (element.dimension === undefined || !element.dimension.height) {
            return null;
        }

        if (this.dataFilter.height.direction === 'down' && element.dimension.height <= this.dataFilter.height.value) {
            return element;
        } else if(this.dataFilter.height.direction === 'up' && element.dimension.height >= this.dataFilter.height.value) {
            return element;
        } else {
            return null;
        }
    }

    /**
     * @param {object} element 
     * @returns 
     */
    _andFilterWidth(element) {
        console.log('_andFilterWidth');
        if (element.dimension === undefined || !element.dimension.width) {
            return null;
        }

        if (this.dataFilter.width.direction === 'down' && element.dimension.width <= this.dataFilter.width.value) {
            return element;
        } else if(this.dataFilter.width.direction === 'up' && element.dimension.width >= this.dataFilter.width.value) {
            return element;
        } else {
            return null;
        }
    }
    
    /**
     * @param {object} element 
     * @returns 
     */
    _andFilterSize(element) {
        console.log('_andFilterSize');

        if (this.dataFilter.size.direction === 'down' && element.size <= this.dataFilter.size.value) {
            return element;
        } else if(this.dataFilter.size.direction === 'up' && element.size >= this.dataFilter.size.value) {
            return element;
        }

        return null;
    }

    /**
     * @param {object} element 
     * @returns 
     */
    _andFilterTags(element) {
        console.log('_andFilterTags');
        if (!element.tags || !Array.isArray(element.tags)) {
            return null;
        }
   
        if (Array.isArray(this.dataFilter.tags)) {
            for (let cont = 0; cont < this.dataFilter.tags.length; cont++) {
               if (element.tags.includes(this.dataFilter.tags[cont]))  {
                    return element;
               }
            }            
        } else if (element.tags.includes(this.dataFilter.tags)) {
            return null;
        }

        return null;
    }
}
