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
            "ipcSender": "IpcSender",
            "entityService": "FileEntity",
            "entityServiceImage": "ImageEntity",
            "entityServiceVideo": "VideoEntity",
            "entityServiceAudio": "AudioEntity",
            "metadataEntity": "MetadataEntity",
            "multiMediaEntity": "MultiMediaEntity",
            "resourceSenderEntity": "ResourceSenderEntity",
            "acl": {
                "resource": 'resource'
            },
            "hydrator": {
                "name-storage-service": "FileEntityHydrator",
                "name-storage-service-image": "ImageEntityHydrator",
                "name-storage-service-video": "VideoEntityHydrator",
                "name-storage-service-audio": "AudioEntityHydrator",
                "name-storage-service-resource": "ResourceEntityHydrator",
                "resource-monitor-service": "ResourceMonitorHydrator",
            }
        }
    }
}