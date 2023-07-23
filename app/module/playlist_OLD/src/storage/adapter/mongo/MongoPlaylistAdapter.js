import {MongoCollectionAdapter} from '@dsign/library/src/storage/adapter/mongo/MongoCollectionAdapter';

/**
 * @class MongoPlaylistAdapter
 */
export class MongoPlaylistAdapter extends MongoCollectionAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let returnFilter = {};
        if (filter !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'tags':
                        if (Array.isArray(filter[property])) {
                            filter[property] = filter[property].join('|')
                        }
                        returnFilter[property] =  {$regex: filter[property], $options: "$i"};
                        break;
                    case 'name':
                        returnFilter[property] =  {$regex: filter[property], $options: "$i"};
                        break;
                }
            }
        }

        return returnFilter;
    }
}
