/**
 * Config
 */
 export const config = {

    "modules": {
        "dashboard": {
            "dashboard" : {
                "storage": {
                    "name-service": "IceHockeyMatchStorage",
                    "adapter": {
                        "localStorage": {
                            "collection": "widget",
                            "namespace": "dsign"
                        }
                    }
                },
                "acl": {
                    "resource": 'dashboard'
                },
                "hydrator": {
                    "name-storage-service": "DashboardEntityHydrator",
                },
                "entityService": "WidgetEntity",
            }
        }
    }
}