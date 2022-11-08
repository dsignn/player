/**
 * Config
 */
 export const config = {
    "resource" : {
        "resource": {
            "storage": {
                "name-service": "ResourceStorage",
                "adapter": {
                    "mongo": {
                        "collection": "resource",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "resource",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "entityService": "FileEntity",
            "entityServiceImage": "ImageEntity",
            "entityServiceVideo": "VideoEntity",
            "entityServiceAudio": "AudioEntity",
            "acl": {
                "resource": 'resource'
            },
            "hydrator": {
                "name-storage-service": "FileEntityHydrator",
                "name-storage-service-image": "ImageEntityHydrator",
                "name-storage-service-video": "VideoEntityHydrator",
                "name-storage-service-audio": "AudioEntityHydrator",
                "name-storage-service-resource": "ResourceEntityHydrator",
            }
        }
    }
}