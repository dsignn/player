/**
 * Config
 */
export const config = {
    "timeline" : {
        "timeline": {
            "storage": {
                "name-service": "TimelineStorage",
                "adapter": {
                    "mongo": {
                        "collection": "timeline",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "timeline",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "entityService": "TimelineEntity",
            "acl": {
                "resource": 'timeline'
            },
            "hydrator": {
                "name-storage-service": "TimelineEntityHydrator",
            },
            "timelineService": "TimelineService"
        }
    }
}