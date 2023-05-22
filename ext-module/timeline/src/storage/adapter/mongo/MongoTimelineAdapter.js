const MongoTimelineAdapter = (async () => {   
  
    const { MongoCollectionAdapter } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/mongo/MongoCollectionAdapter.js`));

    /**
     * @class MongoTimelineAdapter
     */
    class MongoTimelineAdapter extends MongoCollectionAdapter{

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
    return {MongoTimelineAdapter: MongoTimelineAdapter};
})();

export default MongoTimelineAdapter;
export const then = MongoTimelineAdapter.then.bind(MongoTimelineAdapter);
