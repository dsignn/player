/**
 * Config
 */
export const config = {
    "tcp-source": {
        "tcp-source": {
            "storage": {
                "name-service": "TcpSourceStorage",
                "adapter": {
                    "mongo": {
                        "collection": "tcp-source",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "tcp-source",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "entityService": "TcpSourceEntity",
            "hydrator": {
                "name-storage-service": "TcpSourceHydrator",
            },
            "acl": {
                "resource": 'tcp-source'
            }
        }
    }
}