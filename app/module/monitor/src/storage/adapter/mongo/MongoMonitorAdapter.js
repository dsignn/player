import {MongoCollectionAdapter} from "@dsign/library/src/storage/adapter/mongo/MongoCollectionAdapter";

/**
 * @class MongoMonitorAdapter
 */
export class MongoMonitorAdapter extends MongoCollectionAdapter {

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
                    case 'enable':
                        returnFilter[property] =  {$eq: filter[property] ? 1 : 0};
                        break;
                    case 'monitor.name':
                        returnFilter['monitors'] = {$elemMatch: {name: {$regex: filter[property], $options: "$i"}}};
                        break;
                }
            }
        }

        return returnFilter;
    }
}
