/**
 * Config
 */
 export const config = {
    "playlist" : {
        "playlist": {
            "storage": {
                "name-service": "PlaylistStorage",
                "adapter": {
                    "mongo": {
                        "collection": "playlist",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "playlist",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "entityService": "PlaylistEntity",
            "entityServiceTimeslotRef": "TimeslotPlaylistReference",
            "acl": {
                "resource": 'playlist'
            },
            "hydrator": {
                "name-storage-service": "PlaylistEntityHydrator",
            },
            "playlistService": "PlaylistService"
        }
    }
}