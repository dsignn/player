/**
 * Config
 */
export const config = {
    "dashboard": {
        "dashboard": {
            "storage": {
                "name-service": "WidgetStorage",
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