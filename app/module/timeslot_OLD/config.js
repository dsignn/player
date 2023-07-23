/**
 * Config
 */
 export const config = {
    "timeslot" : {
        "timeslot": {
            "storage": {
                "name-service": "TimeslotStorage",
                "adapter": {
                    "mongo": {
                        "collection": "timeslot",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "timeslot",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "entityService": "TimeslotEntity",
            "acl": {
                "resource": 'timeslot'
            },
            "hydrator": {
                "name-storage-service": "TimeslotEntityHydrator",
            },
            "timeslotService": "TimeslotService",
            "injectorDataTimeslotAggregate": "InjectorDataTimeslotAggregate",
            "timeslotSender": "TimeslotSender",
            "timeslotReceiver": "TimeslotReceiver"
        }
    }
}