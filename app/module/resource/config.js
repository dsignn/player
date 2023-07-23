/**
 * Config
 */
 export const config = {
    "resource" : {
        "resource": {
            "resourceReceiver": "ResourceReceiver",
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
            "storage-resource-monitor": {
                "name-service": "ResourceSenderStorage",
                "adapter": {
                    "dexie": {
                        "collection": "resource-monitor",
                        "connection-service": "DexieManager"
                    }
                }
            },
            "resourceSenderService": "ResourceSenderService",
            "resourceService": "ResourceService",
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
                "resource-monitor-storage-service": "ResourceMonitorStorageHydrator",
            }
        }
    }
}