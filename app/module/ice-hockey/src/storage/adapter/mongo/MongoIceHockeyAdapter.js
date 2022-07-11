import {MongoCollectionAdapter} from '@dsign/library/src/storage/adapter/mongo/MongoCollectionAdapter';

/**
 * @class MongoIceHockeyAdapter
 */
export class MongoIceHockeyAdapter extends MongoCollectionAdapter {

    /**
     * @inheritDoc
     */
    filter(filter) {
        return filter;
    }
}
