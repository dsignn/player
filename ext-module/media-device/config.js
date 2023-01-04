/**
 * Config
 */
export const config = {
    "media-device" : {
        "media-device": {
            "storage": {
                "name-service": "MediaDeviceStorage",
                "adapter": {
                    "mongo": {
                        "collection": "media-device",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "media-device",
                        "connection-service": "DexieManager"
                    },
                }
            }, 
            "entityService": "MediaDeviceEntity",
            "acl": {
                "resource": 'media-device'
            },
            "hydrator": {
                "name-storage-service": "MediaDeviceEntityHydrator",
                "chrome-api-storage-service": "MediaDeviceEntityChromeApiHydrator",
            }
        },
        "scoreboard-service": "MediaDeviceStorage",
        "senderService": "IceHockeySender"
    }
}