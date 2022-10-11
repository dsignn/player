/**
 * Config
 */
 export const config = {

    "modules": {
        "admin" : {
            "config": {
                "storage": {
                    "name-service": "ConfigStorage",
                    "adapter": {
                        "filesystem": {
                            "collection": "application"
                        },
                    }
                }, 
                "acl": {
                    "resource": 'admin'
                }
            }
        }
    }
}