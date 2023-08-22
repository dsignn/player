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
            machineService: "MachineService",
            "acl": {
                "resource": 'admin'
            }
        }
    }
}