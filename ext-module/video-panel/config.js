/**
 * Config
 */
 export const config = {
    "video-panel" : {
        "video-panel": {
            "storage-video-panel": {
                "name-service": "VideoPanelStorage",
                "adapter": {
                    "mongo": {
                        "collection": "video-panel",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "video-panel",
                        "connection-service": "DexieManager"
                    }
                }
            }, 
            "storage-video-panel-resource": {
                "name-service": "VideoPanelResourceStorage",
                "adapter": {
                    "mongo": {
                        "collection": "video-panel-resource",
                        "connection-service": "MongoDb"
                    },
                    "dexie": {
                        "collection": "video-panel-resource",
                        "connection-service": "DexieManager"
                    }
                }
            },
            "entityService": "VideoPanelContainerEntity",
            "entityServiceContainer": "VideoPanelResourceContainerEntity",
            "embedded": {
                "monitorMosaic": "MonitorMosaic",
                "videoPanelMosaic": "VideoPanelMosaic",
                "resourceMosaic": "ResourceMosaic",
                "videoPanel": "VideoPanel",
                "videoPanelResource": "VideoPanelResource"
            },
            "acl": {
                "resource": 'video-panel'
            },
            "hydrator": {
                "resource-mosaic-hydrator": "ResourceMosaicHydrator",
                "video-panel-container-mosaic-hydrator": "VideoPanelContainerMosaicHydrator",
                "monitor-container-mosaic-hydrator": "MonitorContainerMosaicHydrator",
                "video-panel-resource-entity-hydrator": "VideoPanelResourceEntityHydrator",
                "video-panel-hydrator": "VideoPanelHydrator",
                "video-panel-resource-container-hydrator": "VideoPanelResourceContainerHydrator",
                "video-panel-to-video-panel-resource-container-hydrator": "VideoPanelToVideoPanelResourceContainerHydrator",
                "video-panel-container-entity-hydrator": "VideoPanelContainerEntityHydrator"      
                
            },
            "videoPanelService": "VideoPanelService"
        }
    }
}