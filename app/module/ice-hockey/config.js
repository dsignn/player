/**
 * Config
 */
export const config = {

    "modules": {
        "ice-hockey" : {
            "ice-hockey-match": {
                "storage": {
                    "name-service": "IceHockeyMatchStorage",
                    "adapter": {
                        "mongo": {
                            "collection": "ice-hockey-match",
                            "connection-service": "MongoDb"
                        },
                        "dexie": {
                            "collection": "ice-hockey-match",
                            "connection-service": "DexieManager"
                        },
                    }
                }, 
                "entityService": "IceHockeyMatchEntity",
                "acl": {
                    "resource": 'ice-hockey'
                },
                "hydrator": {
                    "name-storage-service": "IceHockeyMatchStorageHydrator",
                }
            },
            "scoreboard-service": "IceHockeyScoreboardService",
            "senderService": "IceHockeySender"
        }
    }
}