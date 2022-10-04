import {MongoCollectionAdapter} from '@dsign/library/src/storage/adapter/mongo/MongoCollectionAdapter';

/**
 * @class MongoIceHockeyAdapter
 */
export class MongoIceHockeyAdapter extends MongoCollectionAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {
        let returnFilter = {};
        if (filter !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'name':
                        returnFilter[property] =  {$regex: filter[property], $options: "$i"};
                        break;
                }
            }
        }

        return returnFilter;
    }
}
