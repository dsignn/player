
class MongoMonitorAdapter extends require("@dsign/library").storage.adapter.mongo.MongoCollectionAdapter  {

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

module.exports = MongoMonitorAdapter;
