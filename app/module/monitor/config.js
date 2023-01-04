/**
 * Config
 */
export const config = {
    "monitor" : {
        "monitor": {
            "storage": {
                "name-service": "MonitorStorage",
                "adapter": {
                    "mongo": {
                        "collection": "monitor",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "monitor",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "entityService": "MonitorContainerEntity",
            "entityServiceWrapper": "MonitorEntity",
            "acl": {
                "resource": 'monitor'
            },
            "hydrator": {
                "name-storage-service-monitor": "MonitorEntityHydrator",
                "name-storage-service-monitor-container": "MonitorContaninerEntityHydrator",
            },
            "monitorService": "MonitorService",
            "monitorSender": "MonitorSender",
            "monitorReceiver": "MonitorReceiver"
        }
    }
}