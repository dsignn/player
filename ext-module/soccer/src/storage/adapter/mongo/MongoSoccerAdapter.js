const MongoSoccerAdapter = (async () => {

    const { MongoCollectionAdapter } = await import(require('path').normalize(
        `${container.get('Application').getNodeModulePath()}/@dsign/library/src/storage/adapter/mongo/MongoCollectionAdapter.js`));

    /**
     * @class MongoSoccerAdapter
     */
    class MongoSoccerAdapter extends MongoCollectionAdapter {

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

    return {MongoSoccerAdapter: MongoSoccerAdapter};
})();

export default MongoSoccerAdapter;
export const then = MongoSoccerAdapter.then.bind(MongoSoccerAdapter);
    


