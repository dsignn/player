
class MongoTimeslotAdapter extends require("@dsign/library").storage.adapter.mongo.MongoCollectionAdapter  {

    /**
     * @inheritDoc
     */
    filter(filter) {

        let returnFilter = {};
        if (filter !== null && typeof filter === 'object') {

            for (let property in filter) {

                switch (property) {
                    case 'tags':
                        returnFilter[property] = {$in: filter[property]};
                        break;
                    case 'name':
                        returnFilter[property] = {$regex: filter[property], $options: "$i"};
                        break;
                }
            }
        }

        return returnFilter;
    }
}

module.exports = MongoTimeslotAdapter;
