/**
 * Config
 */
export const config = {
    "soccer": {
        "soccer-match": {
            "storage": {
                "name-service": "SoccerMatchStorage",
                "adapter": {
                    "mongo": {
                        "collection": "soccer-match",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "soccer-match",
                        "connection-service": "DexieManager"
                    },
                }
            },
            "entityService": "SoccerMatchEntity",
            "acl": {
                "resource": 'soccer'
            },
            "hydrator": {
                "name-storage-service": "SoccerMatchStorageHydrator",
            }
        },
        "scoreboard-service": "SoccerScoreboardService",
        "senderService": "SoccerSender"
    }
}