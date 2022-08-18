/**
 * Config
 */
export const config = {
    "modules": {
        "monitor" : {
            "monitor": {
                "storage": {
                    "name-service": "MonitorStorage",
                    "adapter": {
                        "mongo": {
                            "collection": "monitor",
                            "connection-service": "MongoDb"
                        }
                    }
                }, 
                "entityService": "MonitorEntity",
                "acl": {
                    "resource": 'monitor'
                },
                "hydrator": {
                    "name-storage-service": "MonitorEntityHydrator",
                }
            },
            "monitor-container": {
                "entityService": "MonitorContainerEntity",
                "hydrator": {
                    "name-storage-service": "MonitorContaninerEntityHydrator",
                }
            },
            "monitorService": "MonitorService",
            "monitorSender": "MonitorSender",
            "monitorReceiver": "MonitorReceiver"
        }
    }
}