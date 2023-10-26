/**
 * Config
 */
export const config = {
    "admin": {
        "admin": {
            "storage": {
                "name-service": "ConfigStorage",
                "adapter": {
                    "filesystem": {
                        "collection": "application"
                    },
                }
            },
            "deviceStorage": {
                "name-service": "DeviceStorage",
                "adapter": {
                    "xmlHttp": {
                        "collection": "device",
                        "url": "http://api.dsign.local",
                    },
                }
            },
            machineService: "MachineService",
            "acl": {
                "resource": 'admin'
            }
        }
    }
}