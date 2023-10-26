import { EventManagerAware } from "@dsign/library/src/event";

/**
 * @class AuthService
 */
export class AuthService extends EventManagerAware {

    static get ORGANIZATION_ID() { return 'token'; }

    static get LOADED_ORGANIZATION_FROM_TOKEN() { return 'loaded-organization-from-token'; }

    static get RESET_ORGANIZATION_FROM_TOKEN() { return 'reset-organization-from-token'; }

    constructor(storage, xmlHttpStorage) {
        super();

        this.token = '';

        this.storage = storage;

        this.xmlHttpStorage = xmlHttpStorage;

        this.storage.get('token')
            .then((data) => {
                if (data) {

                    this.setOrganizationToken(data.token);
                   
                }
           
            }).catch((error) => {
                this.setOrganizationToken(null);
                console.error(error);
            });

        
        this.organization = null;
    }

    getOrganization() {
        return this.organization;
    }

    /**
     * @returns string
     */
    getOrganizationToken() {
        return this.token;
    }

    /**
     * @param {string} token 
     * @returns 
     */
    setOrganizationToken(token) {

        this.token = token;
        if (token) {
            this.xmlHttpStorage.adapter.addHeader('Authorization', `Bearer ${token}`);
        } else {
            adapter.removeHeader('Authorization');
        }
        
        let tokenObj = {
            "id": AuthService.ORGANIZATION_ID,
            "token": token
        };

        this.xmlHttpStorage.get('').then(
            (data) => {
                this.organization = data;
                this.getEventManager().emit(
                    AuthService.LOADED_ORGANIZATION_FROM_TOKEN,
                    this.organization 
                )
            }
        ).catch((error) => {
            this.organization = null;
            this.getEventManager().emit(
                AuthService.RESET_ORGANIZATION_FROM_TOKEN,
                {}
            )
        });

        return this.storage.save(tokenObj);
    }
}